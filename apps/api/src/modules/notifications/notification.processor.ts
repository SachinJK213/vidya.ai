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

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    @Inject(EMAIL_PROVIDER) private emailProvider: IEmailProvider | null,
    @Inject(SMS_PROVIDER) private smsProvider: ISmsProvider | null,
  ) {}

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
