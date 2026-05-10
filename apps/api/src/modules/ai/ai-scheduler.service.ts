import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from './ai.service';

@Injectable()
export class AiSchedulerService {
  private readonly logger = new Logger(AiSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  // Runs every Friday at 17:00 — generates weekly attendance summaries for all active students
  @Cron('0 17 * * 5', { name: 'weekly-ai-summaries', timeZone: 'Asia/Kolkata' })
  async generateWeeklySummaries() {
    if (!this.aiService.isEnabled) {
      this.logger.log('AI provider disabled — skipping weekly summary generation');
      return;
    }

    const weekStart = this.getMondayOfCurrentWeek();
    this.logger.log(`Starting weekly AI summary generation for week ${weekStart}`);

    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    let generated = 0;
    let skipped = 0;

    for (const tenant of tenants) {
      try {
        const students = await this.prisma.student.findMany({
          where: { tenantId: tenant.id, isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            grade: true,
            family: {
              select: {
                members: {
                  where: { isPrimary: true },
                  select: { userId: true },
                },
              },
            },
          },
        });

        for (const student of students) {
          const primaryParentId = student.family?.members[0]?.userId;
          if (!primaryParentId) {
            skipped++;
            continue;
          }

          // Check if a summary was already generated this week for this student
          const existingSummary = await this.prisma.notificationEvent.findFirst({
            where: {
              tenantId: tenant.id,
              type: 'AI_WEEKLY_SUMMARY',
              recipientId: primaryParentId,
              createdAt: { gte: new Date(weekStart) },
            },
          });

          if (existingSummary) {
            skipped++;
            continue;
          }

          await this.notificationQueue.add(
            'generate-weekly-summary',
            { tenantId: tenant.id, studentId: student.id, weekStart },
            { attempts: 2, backoff: { type: 'fixed', delay: 10000 } },
          );
          generated++;
        }
      } catch (err) {
        this.logger.error(`Failed to queue summaries for tenant ${tenant.id}`, err);
      }
    }

    this.logger.log(`Weekly summary jobs queued: ${generated} enqueued, ${skipped} skipped`);
  }

  private getMondayOfCurrentWeek(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }
}
