import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload, Role } from '@vidyaai/shared';
import { SendAnnouncementDto } from './dto/send-announcement.dto';
import { SendEmergencyDto } from './dto/send-emergency.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private queue: Queue,
  ) {}

  async sendAnnouncement(tenantId: string, sender: JwtPayload, dto: SendAnnouncementDto) {
    const targetRoles = dto.targetRoles ?? [Role.PARENT, Role.TEACHER];

    const recipients = await this.prisma.user.findMany({
      where: { tenantId, isActive: true, role: { in: targetRoles as any[] } },
      select: { id: true },
    });

    const events = await Promise.all(
      recipients.map((r) =>
        this.prisma.notificationEvent.create({
          data: {
            tenantId,
            type: 'ANNOUNCEMENT',
            channel: 'EMAIL',
            recipientId: r.id,
            payload: {
              subject: dto.subject,
              body: dto.body,
              senderEmail: sender.email,
            },
          },
          select: { id: true },
        }),
      ),
    );

    for (const event of events) {
      await this.queue.add('send-notification', { notificationEventId: event.id });
    }

    return { queued: events.length };
  }

  async sendEmergency(tenantId: string, sender: JwtPayload, dto: SendEmergencyDto) {
    const recipients = await this.prisma.user.findMany({
      where: { tenantId, isActive: true, role: { in: ['PARENT', 'TEACHER'] as any[] } },
      select: { id: true },
    });

    const events = await Promise.all(
      recipients.map((r) =>
        this.prisma.notificationEvent.create({
          data: {
            tenantId,
            type: 'EMERGENCY',
            channel: 'EMAIL',
            recipientId: r.id,
            payload: {
              message: dto.message,
              senderEmail: sender.email,
            },
          },
          select: { id: true },
        }),
      ),
    );

    for (const event of events) {
      await this.queue.add('send-notification', { notificationEventId: event.id, priority: 1 });
    }

    return { queued: events.length };
  }

  async listForRecipient(tenantId: string, recipientId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { tenantId, recipientId };

    const [data, total] = await Promise.all([
      this.prisma.notificationEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          channel: true,
          status: true,
          payload: true,
          isAiDraft: true,
          sentAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notificationEvent.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getUnreadCount(tenantId: string, recipientId: string): Promise<{ unread: number }> {
    const unread = await this.prisma.notificationEvent.count({
      where: {
        tenantId,
        recipientId,
        status: { notIn: ['READ', 'FAILED'] },
      },
    });
    return { unread };
  }

  async markAsRead(tenantId: string, recipientId: string, notificationEventId: string) {
    const event = await this.prisma.notificationEvent.findFirst({
      where: { id: notificationEventId, tenantId, recipientId },
    });
    if (!event) throw new NotFoundException('Notification not found');

    await this.prisma.notificationEvent.update({
      where: { id: notificationEventId },
      data: { status: 'READ' },
    });

    return { read: true };
  }

  async markAllRead(tenantId: string, recipientId: string) {
    const { count } = await this.prisma.notificationEvent.updateMany({
      where: {
        tenantId,
        recipientId,
        status: { notIn: ['READ', 'FAILED', 'PENDING'] },
      },
      data: { status: 'READ' },
    });
    return { marked: count };
  }

  async approveAiDraft(tenantId: string, approverId: string, notificationEventId: string) {
    const event = await this.prisma.notificationEvent.findFirst({
      where: { id: notificationEventId, tenantId, isAiDraft: true, status: 'PENDING' },
    });
    if (!event) throw new NotFoundException('Pending AI draft not found');

    await this.prisma.notificationEvent.update({
      where: { id: notificationEventId },
      data: { approvedBy: approverId, approvedAt: new Date(), status: 'QUEUED' },
    });

    await this.queue.add('send-notification', { notificationEventId });
    return { approved: true };
  }
}
