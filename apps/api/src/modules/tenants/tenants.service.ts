import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { DeploymentMode } from '@vidyaai/shared';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

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
        },
      }),
      this.prisma.tenant.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
