# VidyaAI — CLAUDE.md

## Project

AI-first school management platform for K-12 schools. Solo-founder project.
Full spec: [school-management-ai-specification.md](school-management-ai-specification.md)
GitHub: https://github.com/SachinJK213/vidya.ai

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | NestJS + TypeScript | `apps/api/` |
| Frontend | Vite + React + TypeScript | `apps/web/` |
| ORM | Prisma | schema at `packages/prisma/schema.prisma` |
| Database | PostgreSQL 16 | multi-tenant via `tenant_id` + Postgres RLS |
| Queue | BullMQ on Redis | all async jobs: notifications, AI, report gen |
| Auth | JWT + NestJS guards | flat role enum, no RBAC tables in Phase 1 |
| Components | shadcn/ui + Tailwind | mobile-first, responsive |

## Monorepo Layout

```
apps/
  api/        NestJS backend
  web/        Vite + React frontend
packages/
  prisma/     Prisma schema + migrations (source of truth for all models)
  shared/     Shared TypeScript types and enums (DTOs, JwtPayload, Role, etc.)
docker-compose.yml          base stack
docker-compose.onprem.yml   on-prem override (adds MinIO, Ollama, Prometheus, Grafana)
.env.example                all environment variables documented here
```

## Multi-Tenancy

- Every table has `tenantId` (Postgres RLS enforced at DB level).
- Tenant resolved per request by `TenantMiddleware` — from subdomain or `X-Tenant-Code` header.
- JWT payload always includes `{ sub, tenantId, role, email }`.
- Do not query any table without a `tenantId` filter. Ever.

## Deployment Modes (from spec section 22)

Three modes. All use the same app code; only provider bindings differ.

| Mode | Email | SMS | AI | Storage | Queue | Monitoring |
|---|---|---|---|---|---|---|
| SaaS | SES / SendGrid | Twilio / MSG91 | Claude API | S3 | Redis | DataDog |
| MicroSaaS | Tenant SMTP creds | Twilio / MSG91 | Claude (tenant key) | S3 | Redis | Prometheus |
| OnPrem | Customer SMTP relay | Kannel SMPP / HTTP | Ollama (air-gap) or Claude | MinIO | Self-hosted Redis | Prometheus + Grafana |

**On-prem rules:**
- Zero external telemetry (`TELEMETRY_ENABLED=false` by default).
- AI features degrade gracefully when `AI_PROVIDER=disabled` — return `null`, show fallback UI.
- All provider implementations are behind interfaces (`IEmailProvider`, `ISmsProvider`, `IAiProvider`).
- Provider selected at startup via `DEPLOYMENT_MODE` / `EMAIL_PROVIDER` / `SMS_PROVIDER` / `AI_PROVIDER` env vars.
- On-prem compose: `docker-compose -f docker-compose.yml -f docker-compose.onprem.yml up -d`

## Provider Interface Pattern

```
src/modules/notifications/providers/email/email.interface.ts  ← IEmailProvider
src/modules/notifications/providers/sms/sms.interface.ts      ← ISmsProvider
src/modules/ai/providers/ai.interface.ts                      ← IAiProvider
```

New providers: implement the interface, add to the factory in the module, add env var to `.env.example`.
Do not add provider-specific logic to service classes. Services depend only on the interface.

## AI Rules (spec section 8)

- All AI outputs are **drafts** — never auto-send, never auto-act.
- Always show `isAiDraft: true` flag to the UI.
- Always require a human confirmation action before any AI-generated content is sent.
- When `AI_PROVIDER=disabled` or `isEnabled === false`, return `null` and show a graceful fallback in UI.
- No PII in AI prompts beyond what is explicitly needed for the specific feature.

## Key Conventions

- **No raw Prisma queries without `tenantId`** — always filter at the service layer.
- **DTOs for all controller inputs** — `class-validator` + `class-transformer` required.
- **Guards**: `JwtAuthGuard` for auth, `RolesGuard` for role checks. Decorate with `@Roles(Role.TEACHER)`.
- **No magic strings** — use enums from `@vidyaai/shared` for `Role`, `AttendanceStatus`, etc.
- **No comments explaining what code does** — names should be self-explanatory.
- **No auto-commit, no auto-push** — always ask before git operations.

## Phase 1 MVP Scope

Build only these modules (in order):

1. Tenants + Users (auth foundation)
2. Students + Families (SIS)
3. Attendance (mark + view)
4. Parent portal (read-only: attendance, announcements)
5. Notification engine: 3 triggers (absent, announcement, emergency) — email + in-app
6. AI: weekly summary for parent + absence draft for teacher

Do NOT build: timetable, fee management, full gradebook, mobile apps, Kafka event bus.

## Running Locally

```bash
# Install
pnpm install

# Start infra
docker compose up postgres redis -d

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start API
pnpm dev:api

# Start Web
pnpm dev:web
```

## On-Prem Local Testing

```bash
docker compose -f docker-compose.yml -f docker-compose.onprem.yml up -d
# Then set AI_PROVIDER=ollama and pull a model:
docker exec -it <ollama_container> ollama pull llama3
```
