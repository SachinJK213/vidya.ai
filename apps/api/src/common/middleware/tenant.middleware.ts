import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

// Resolves tenant from subdomain (school.vidyaai.com) or X-Tenant-Code header
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantCode = this.resolveTenantCode(req);

    if (!tenantCode) {
      return next();
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { code: tenantCode },
      select: { id: true, isActive: true },
    });

    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Invalid or inactive tenant');
    }

    (req as any).tenantId = tenant.id;
    next();
  }

  private resolveTenantCode(req: Request): string | null {
    const headerCode = req.headers['x-tenant-code'] as string;
    if (headerCode) return headerCode;

    const host = req.hostname;
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];

    return null;
  }
}
