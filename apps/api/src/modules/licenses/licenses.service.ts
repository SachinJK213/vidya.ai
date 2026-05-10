import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { LicensePlan, PLAN_DEFAULTS } from '@vidyaai/shared';

export interface LicenseStatusInfo {
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'GRACE_PERIOD' | 'EXPIRED' | 'SUSPENDED';
  daysUntilExpiry: number;
}

const GRACE_DAYS = 7;
const EXPIRING_SOON_DAYS = 30;
const REMINDER_THRESHOLDS = [30, 14, 7, 1, 0];

@Injectable()
export class LicensesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  computeStatus(expiresAt: Date, isSuspended = false): LicenseStatusInfo {
    if (isSuspended) return { status: 'SUSPENDED', daysUntilExpiry: 0 };
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / msPerDay);
    let status: LicenseStatusInfo['status'];
    if (daysUntilExpiry > EXPIRING_SOON_DAYS) status = 'ACTIVE';
    else if (daysUntilExpiry > 0) status = 'EXPIRING_SOON';
    else if (daysUntilExpiry >= -GRACE_DAYS) status = 'GRACE_PERIOD';
    else status = 'EXPIRED';
    return { status, daysUntilExpiry };
  }

  private withStatus(license: any) {
    const { status, daysUntilExpiry } = this.computeStatus(
      license.expiresAt,
      license.isSuspended,
    );
    return { ...license, status, daysUntilExpiry };
  }

  async assign(assignedById: string, dto: AssignLicenseDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const existing = await this.prisma.tenantLicense.findUnique({ where: { tenantId: dto.tenantId } });
    if (existing) throw new ConflictException('Tenant already has a license — use PATCH to update it');

    const plan = dto.plan as LicensePlan;
    const license = await this.prisma.tenantLicense.create({
      data: {
        tenantId: dto.tenantId,
        plan,
        maxStudents: dto.maxStudents ?? PLAN_DEFAULTS[plan].maxStudents,
        maxUsers: dto.maxUsers ?? PLAN_DEFAULTS[plan].maxUsers,
        features: { ...PLAN_DEFAULTS[plan].features, ...(dto.features ?? {}) },
        expiresAt: new Date(dto.expiresAt),
        notes: dto.notes,
        assignedById,
      },
      include: { tenant: { select: { name: true, code: true } } },
    });

    // Re-activate tenant if it was locked
    await this.prisma.tenant.update({ where: { id: dto.tenantId }, data: { isActive: true } });

    return this.withStatus(license);
  }

  async update(id: string, dto: UpdateLicenseDto) {
    const existing = await this.prisma.tenantLicense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('License not found');

    const data: any = {};
    if (dto.plan) {
      data.plan = dto.plan;
      const plan = dto.plan as LicensePlan;
      data.maxStudents = dto.maxStudents ?? PLAN_DEFAULTS[plan].maxStudents;
      data.maxUsers = dto.maxUsers ?? PLAN_DEFAULTS[plan].maxUsers;
      data.features = { ...PLAN_DEFAULTS[plan].features, ...(dto.features ?? {}) };
    } else {
      if (dto.maxStudents) data.maxStudents = dto.maxStudents;
      if (dto.maxUsers) data.maxUsers = dto.maxUsers;
      if (dto.features) data.features = { ...(existing.features as object), ...dto.features };
    }
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.status === 'SUSPENDED') {
      data.isSuspended = true;
    } else if (dto.status === 'ACTIVE') {
      data.isSuspended = false;
      await this.prisma.tenant.update({ where: { id: existing.tenantId }, data: { isActive: true } });
    }

    const updated = await this.prisma.tenantLicense.update({
      where: { id },
      data,
      include: { tenant: { select: { name: true, code: true } }, reminders: { orderBy: { sentAt: 'desc' }, take: 5 } },
    });
    return this.withStatus(updated);
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.tenantLicense.findMany({
        skip,
        take: limit,
        orderBy: { expiresAt: 'asc' },
        include: {
          tenant: { select: { id: true, name: true, code: true, isActive: true } },
          reminders: { orderBy: { sentAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.tenantLicense.count(),
    ]);
    return {
      data: data.map((l) => this.withStatus(l)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByTenant(tenantId: string) {
    const license = await this.prisma.tenantLicense.findUnique({
      where: { tenantId },
      include: {
        tenant: { select: { name: true, code: true, _count: { select: { users: true, students: true } } } },
        reminders: { orderBy: { sentAt: 'desc' }, take: 10 },
      },
    });
    if (!license) return null;
    return this.withStatus(license);
  }

  async sendReminder(licenseId: string, sentById: string | null, triggerDays = -1) {
    const license = await this.prisma.tenantLicense.findUnique({
      where: { id: licenseId },
      include: { tenant: { select: { id: true, name: true } } },
    });
    if (!license) throw new NotFoundException('License not found');

    const admins = await this.prisma.user.findMany({
      where: { tenantId: license.tenantId, role: 'SCHOOL_ADMIN', isActive: true },
      select: { id: true, email: true, firstName: true },
    });
    if (admins.length === 0) throw new BadRequestException('No active School Admin found for this tenant');

    const { daysUntilExpiry } = this.computeStatus(license.expiresAt);
    const payload = {
      licenseId: license.id,
      tenantName: license.tenant.name,
      plan: license.plan,
      expiresAt: license.expiresAt.toISOString(),
      daysUntilExpiry,
      triggerDays,
    };

    for (const admin of admins) {
      await this.prisma.notificationEvent.create({
        data: {
          tenantId: license.tenantId,
          type: 'LICENSE_EXPIRY_REMINDER',
          channel: 'IN_APP',
          status: 'SENT',
          recipientId: admin.id,
          payload,
        },
      });

      await this.notificationsQueue.add('send-notification', {
        tenantId: license.tenantId,
        recipientId: admin.id,
        type: 'LICENSE_EXPIRY_REMINDER',
        channel: 'EMAIL',
        payload: { ...payload, recipientEmail: admin.email, recipientName: admin.firstName },
      }).catch(() => null);
    }

    await this.prisma.licenseReminder.create({
      data: { licenseId, sentById, triggerDays },
    });

    return { sent: admins.length, recipients: admins.map((a) => a.email) };
  }

  async runScheduledCheck() {
    const licenses = await this.prisma.tenantLicense.findMany({
      where: { tenant: { isActive: true } },
      include: { reminders: { select: { triggerDays: true } } },
    });

    for (const license of licenses) {
      const { daysUntilExpiry } = this.computeStatus(license.expiresAt);

      for (const threshold of REMINDER_THRESHOLDS) {
        if (daysUntilExpiry <= threshold) {
          const alreadySent = license.reminders.some((r) => r.triggerDays === threshold);
          if (!alreadySent) {
            await this.sendReminder(license.id, null, threshold).catch(() => null);
          }
        }
      }

      if (daysUntilExpiry < -GRACE_DAYS) {
        await this.prisma.tenant.update({ where: { id: license.tenantId }, data: { isActive: false } });
      }
    }
  }
}
