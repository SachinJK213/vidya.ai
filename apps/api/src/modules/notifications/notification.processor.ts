import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { IEmailProvider, EMAIL_PROVIDER } from './providers/email/email.interface';
import { ISmsProvider, SMS_PROVIDER } from './providers/sms/sms.interface';

interface AbsenceAlertJob {
  tenantId: string;
  studentId: string;
  date: string;
  teacherId: string;
}

interface SendNotificationJob {
  notificationEventId: string;
}

interface WeeklySummaryJob {
  tenantId: string;
  studentId: string;
  weekStart: string;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    @Inject(EMAIL_PROVIDER) private emailProvider: IEmailProvider | null,
    @Inject(SMS_PROVIDER) private smsProvider: ISmsProvider | null,
  ) {}

  @Process('send-mfa-email')
  async handleMfaEmail(job: Job<{ to: string; type: 'OTP' | 'MAGIC_LINK'; value: string }>) {
    const { to, type, value } = job.data;

    if (!this.emailProvider) {
      this.logger.warn(`[DEV] MFA ${type} for ${to} → ${value}`);
      return;
    }

    if (type === 'OTP') {
      await this.emailProvider.send({
        to,
        subject: 'Your VidyaAI verification code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">VidyaAI — Verification Code</h2>
            <p>Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
              padding: 20px; background: #f5f5ff; border-radius: 8px; color: #4f46e5;">
              ${value}
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } else {
      await this.emailProvider.send({
        to,
        subject: 'Sign in to VidyaAI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">VidyaAI — Magic Sign-in Link</h2>
            <p>Click the button below to sign in to your account. This link expires in <strong>15 minutes</strong> and can only be used once.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${value}" style="background: #4f46e5; color: white; padding: 12px 28px;
                border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Sign in to VidyaAI
              </a>
            </div>
            <p style="color: #888; font-size: 12px;">
              If you didn't request this link, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    }
  }

  @Process('absence-alert')
  async handleAbsenceAlert(job: Job<AbsenceAlertJob>) {
    const { tenantId, studentId, date, teacherId } = job.data;

    const [student, teacher] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, tenantId },
        select: {
          firstName: true,
          lastName: true,
          grade: true,
          family: {
            select: {
              members: {
                where: { isPrimary: true },
                select: { user: { select: { id: true, email: true, firstName: true, phone: true } } },
              },
            },
          },
        },
      }),
      this.prisma.user.findFirst({
        where: { id: teacherId, tenantId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    if (!student) {
      this.logger.warn(`Student ${studentId} not found for absence alert`);
      return;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const primaryParent = student.family?.members[0]?.user;
    if (!primaryParent) {
      this.logger.warn(`No primary parent found for student ${studentId}`);
      return;
    }

    const studentName = `${student.firstName} ${student.lastName}`;
    const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Teacher';

    const aiDraft = await this.aiService.draftAbsenceNotification({
      studentName,
      grade: student.grade,
      absentDate: date,
      teacherName,
    });

    await this.prisma.notificationEvent.create({
      data: {
        tenantId,
        type: 'ABSENCE_ALERT',
        channel: 'EMAIL',
        recipientId: primaryParent.id,
        isAiDraft: !!aiDraft,
        payload: {
          studentName,
          grade: student.grade,
          absentDate: date,
          teacherName,
          schoolName: tenant?.name ?? '',
          message: aiDraft,
          parentEmail: primaryParent.email,
          parentName: primaryParent.firstName,
        },
        // AI drafts require human approval before sending — kept PENDING
        status: aiDraft ? 'PENDING' : 'QUEUED',
      },
    });

    this.logger.log(
      `Absence alert created for ${studentName} (${date}). AI draft: ${!!aiDraft}`,
    );
  }

  @Process('generate-weekly-summary')
  async handleWeeklySummary(job: Job<WeeklySummaryJob>) {
    const { tenantId, studentId, weekStart } = job.data;

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        firstName: true, lastName: true, grade: true,
        family: {
          select: {
            members: {
              where: { isPrimary: true },
              select: { user: { select: { id: true } } },
            },
          },
        },
      },
    });
    if (!student) return;

    const primaryParent = student.family?.members[0]?.user;
    if (!primaryParent) return;

    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const events = await this.prisma.attendanceEvent.findMany({
      where: { tenantId, studentId, date: { gte: start, lt: end } },
      select: { date: true, status: true },
    });

    const totalDays = events.length;
    const presentDays = events.filter((e) => e.status === 'PRESENT').length;
    const absenceDates = events
      .filter((e) => e.status === 'ABSENT')
      .map((e) => e.date.toISOString().split('T')[0]);

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });

    const aiText = await this.aiService.summarizeWeeklyAttendance({
      studentName: `${student.firstName} ${student.lastName}`,
      grade: student.grade,
      presentDays,
      totalDays,
      absenceDates,
      schoolName: tenant?.name ?? '',
    });

    if (!aiText) return;

    const notif = await this.prisma.notificationEvent.create({
      data: {
        tenantId,
        type: 'AI_WEEKLY_SUMMARY',
        channel: 'EMAIL',
        recipientId: primaryParent.id,
        isAiDraft: true,
        status: 'PENDING',
        payload: {
          studentName: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          weekStart,
          presentDays,
          totalDays,
          absenceDates,
          aiSummary: aiText,
        },
      },
      select: { id: true },
    });

    this.logger.log(`Generated weekly summary for student ${studentId}, notif ${notif.id}`);
  }

  @Process('send-notification')
  async handleSendNotification(job: Job<SendNotificationJob>) {
    const { notificationEventId } = job.data;

    const event = await this.prisma.notificationEvent.findUnique({
      where: { id: notificationEventId },
      include: { recipient: { select: { email: true, phone: true, firstName: true } } },
    });

    if (!event) {
      this.logger.warn(`NotificationEvent ${notificationEventId} not found`);
      return;
    }

    // AI drafts that haven't been approved stay PENDING — skip sending
    if (event.isAiDraft && !event.approvedAt) {
      this.logger.log(`Skipping unapproved AI draft ${notificationEventId}`);
      return;
    }

    await this.prisma.notificationEvent.update({
      where: { id: notificationEventId },
      data: { status: 'QUEUED' },
    });

    try {
      if (event.channel === 'EMAIL' && this.emailProvider) {
        await this.sendEmail(event);
      } else if (event.channel === 'SMS' && this.smsProvider) {
        await this.sendSms(event);
      }

      await this.prisma.notificationEvent.update({
        where: { id: notificationEventId },
        data: { status: 'SENT', sentAt: new Date() },
      });

      this.logger.log(`Sent ${event.type} notification ${notificationEventId}`);
    } catch (err) {
      this.logger.error(`Failed to send notification ${notificationEventId}`, err);
      await this.prisma.notificationEvent.update({
        where: { id: notificationEventId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          error: (err as Error).message,
          retryCount: { increment: 1 },
        },
      });
      throw err;
    }
  }

  private async sendEmail(event: any) {
    const payload = event.payload as any;
    const recipient = event.recipient;

    let subject = '';
    let html = '';

    switch (event.type) {
      case 'ABSENCE_ALERT':
        subject = `Absence Alert — ${payload.studentName} (${payload.absentDate})`;
        html = this.buildAbsenceEmailHtml(payload);
        break;
      case 'ANNOUNCEMENT':
        subject = payload.subject ?? 'School Announcement';
        html = `<p>${payload.body}</p>`;
        break;
      case 'EMERGENCY':
        subject = '[URGENT] School Emergency Alert';
        html = `<p><strong>${payload.message}</strong></p>`;
        break;
      default:
        subject = 'School Notification';
        html = `<p>${JSON.stringify(payload)}</p>`;
    }

    await this.emailProvider!.send({
      to: recipient.email,
      subject,
      html,
    });
  }

  private async sendSms(event: any) {
    const recipient = event.recipient;
    if (!recipient.phone) return;

    const payload = event.payload as any;
    let message = '';

    switch (event.type) {
      case 'ABSENCE_ALERT':
        message = `Dear ${payload.parentName}, ${payload.studentName} was absent on ${payload.absentDate}. Contact the school for details.`;
        break;
      case 'EMERGENCY':
        message = `[URGENT] ${payload.message}`;
        break;
      default:
        message = payload.body ?? payload.message ?? 'School notification';
    }

    await this.smsProvider!.send({ to: recipient.phone, message });
  }

  private buildAbsenceEmailHtml(payload: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Attendance Alert — ${payload.schoolName}</h2>
        <p>Dear ${payload.parentName},</p>
        ${
          payload.message
            ? `<p>${payload.message}</p>`
            : `<p>This is to inform you that <strong>${payload.studentName}</strong> (Grade ${payload.grade}) was marked <strong>absent</strong> on <strong>${payload.absentDate}</strong>.</p>`
        }
        <p>If you have any questions, please contact the school.</p>
        <p style="color: #666; font-size: 12px;">This is an automated message from ${payload.schoolName}.</p>
      </div>
    `;
  }
}
