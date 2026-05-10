import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { OnboardTenantDto } from './dto/onboard-tenant.dto';
import { DeploymentMode } from '@vidyaai/shared';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async onboard(dto: OnboardTenantDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Tenant code already taken');

    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          code: dto.code,
          domain: dto.domain,
          deploymentMode: (dto.deploymentMode as any) ?? 'SAAS',
        },
      });

      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.adminEmail,
          passwordHash,
          role: 'SCHOOL_ADMIN',
          firstName: dto.adminFirstName,
          lastName: dto.adminLastName,
        },
        select: { id: true, email: true, role: true },
      });

      return { tenant, admin };
    });
  }

  async checkCode(code: string) {
    if (!code) return { available: false };
    const existing = await this.prisma.tenant.findUnique({ where: { code } });
    return { available: !existing };
  }

  async findByCode(code: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { code },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        deploymentMode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { users: true, students: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Tenant code already taken');

    return this.prisma.tenant.create({
      data: {
        name: dto.name,
        code: dto.code,
        domain: dto.domain,
        deploymentMode: (dto.deploymentMode as any) ?? 'SAAS',
      },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        deploymentMode: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        deploymentMode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { users: true, students: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        code: true,
        domain: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async getStats() {
    const GRACE_DAYS = 7;
    const EXPIRING_SOON_DAYS = 30;
    const msPerDay = 1000 * 60 * 60 * 24;
    const platformExclude = { code: { not: 'platform' } };

    const [totalTenants, activeTenants, students, users, licenses, noLicenseTenants, recentTenants] =
      await Promise.all([
        this.prisma.tenant.count({ where: platformExclude }),
        this.prisma.tenant.count({ where: { ...platformExclude, isActive: true } }),
        this.prisma.student.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: true, NOT: { role: 'SUPER_ADMIN' } } }),
        this.prisma.tenantLicense.findMany({
          where: { tenant: platformExclude },
          select: {
            id: true,
            tenantId: true,
            plan: true,
            expiresAt: true,
            isSuspended: true,
            tenant: { select: { id: true, name: true, code: true, isActive: true } },
          },
        }),
        this.prisma.tenant.findMany({
          where: { ...platformExclude, isActive: true, license: null },
          select: { id: true, name: true, code: true },
        }),
        this.prisma.tenant.findMany({
          where: platformExclude,
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true, name: true, code: true, deploymentMode: true, isActive: true, createdAt: true,
            license: { select: { plan: true, expiresAt: true, isSuspended: true } },
          },
        }),
      ]);

    const byStatus: Record<string, number> = {
      ACTIVE: 0, EXPIRING_SOON: 0, GRACE_PERIOD: 0, EXPIRED: 0, SUSPENDED: 0,
    };
    const byPlan: Record<string, number> = {
      TRIAL: 0, STARTER: 0, PROFESSIONAL: 0, ENTERPRISE: 0,
    };
    const attentionNeeded: any[] = [];

    for (const lic of licenses) {
      byPlan[lic.plan] = (byPlan[lic.plan] ?? 0) + 1;

      let status: string;
      if (lic.isSuspended) {
        status = 'SUSPENDED';
      } else {
        const days = Math.floor((lic.expiresAt.getTime() - Date.now()) / msPerDay);
        if (days > EXPIRING_SOON_DAYS) status = 'ACTIVE';
        else if (days > 0) status = 'EXPIRING_SOON';
        else if (days >= -GRACE_DAYS) status = 'GRACE_PERIOD';
        else status = 'EXPIRED';
      }

      byStatus[status]++;

      if (['EXPIRING_SOON', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED'].includes(status)) {
        attentionNeeded.push({
          ...lic.tenant,
          license: { id: lic.id, plan: lic.plan, expiresAt: lic.expiresAt, isSuspended: lic.isSuspended, status },
        });
      }
    }

    return {
      counts: {
        total: totalTenants,
        active: activeTenants,
        locked: totalTenants - activeTenants,
        noLicense: noLicenseTenants.length,
      },
      scale: { students, users },
      licenses: { byStatus, byPlan },
      attentionNeeded,
      noLicenseTenants,
      recentTenants,
    };
  }

  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          code: true,
          deploymentMode: true,
          isActive: true,
          createdAt: true,
          _count: { select: { users: true, students: true } },
          license: {
            select: { id: true, plan: true, expiresAt: true, isSuspended: true },
          },
        },
      }),
      this.prisma.tenant.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
