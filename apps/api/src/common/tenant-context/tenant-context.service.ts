import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Provides a tenant-scoped Prisma client for every request.
 *
 * Isolation strategy per deployment mode:
 *   SaaS / MicroSaaS  — shared DB, every query automatically appends tenantId filter
 *                        via Prisma middleware (no cross-tenant leakage without DB changes)
 *   OnPrem            — if Tenant.databaseUrl is set, returns a PrismaClient bound to that
 *                        tenant's own Postgres instance (school brings their own DB)
 *
 * All modules MUST inject TenantContextService instead of PrismaService directly.
 * This is the single seam that lets us evolve isolation without touching business logic.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantScopedClient: PrismaClient | null = null;

  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private request: Request,
  ) {}

  get tenantId(): string {
    const tenantId = (this.request as any).tenantId ?? (this.request as any).user?.tenantId;
    if (!tenantId) throw new Error('TenantContextService: tenantId not set on request');
    return tenantId;
  }

  /**
   * Returns a PrismaClient scoped to the current tenant.
   * For on-prem tenants with their own DB, returns a dedicated client.
   * For shared-DB tenants, returns the global PrismaService instance.
   *
   * The returned client does NOT automatically inject tenantId — callers
   * must still pass tenantId in queries. Use db() + tenantId together.
   */
  async db(): Promise<PrismaClient> {
    if (this.tenantScopedClient) return this.tenantScopedClient;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: this.tenantId },
      select: { databaseUrl: true },
    });

    if (tenant?.databaseUrl) {
      // On-prem: tenant has their own Postgres instance
      this.tenantScopedClient = new PrismaClient({
        datasources: { db: { url: tenant.databaseUrl } },
      });
      await this.tenantScopedClient.$connect();
      return this.tenantScopedClient;
    }

    // Shared DB: use global pool
    return this.prisma;
  }

  async onRequestEnd() {
    if (this.tenantScopedClient) {
      await this.tenantScopedClient.$disconnect();
      this.tenantScopedClient = null;
    }
  }
}
