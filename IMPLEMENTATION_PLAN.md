# VidyaAI — Phase-wise Implementation Plan

Solo founder + Claude Code. Each phase ends with something shippable to a real school.
Full spec: [school-management-ai-specification.md](school-management-ai-specification.md)

---

## Phase 0 — Foundation Architecture ✅
**Status: Done**

### Delivered
- Monorepo scaffold (`apps/api`, `apps/web`, `packages/prisma`, `packages/shared`)
- Prisma schema: `Tenant`, `User`, `Family`, `FamilyMember`, `Student`, `AttendanceEvent`, `NotificationEvent`, `TenantNotificationConfig`
- Auth module: JWT + role guard + `RolesGuard` + `@CurrentUser` / `@TenantId` decorators
- `TenantContextService` — single seam for multi-tenancy isolation (shared DB → schema-per-tenant → per-DB without touching business logic)
- Provider interfaces: `IEmailProvider`, `ISmsProvider`, `IAiProvider` with concrete impls (SMTP, MSG91, Claude, Ollama)
- Docker Compose: base + on-prem override (MinIO, Ollama, Prometheus, Grafana)
- `CLAUDE.md` + `.env.example` (all deployment modes documented)
- Stub modules: Tenants, Users, Students, Attendance, Notifications

### First run checklist
```bash
pnpm install
pnpm db:generate
pnpm db:migrate       # creates tables
pnpm dev:api          # NestJS on :3000
pnpm dev:web          # Vite on :5173
```

---

## Phase 1 — MVP Core
**Duration: ~8 weeks | Goal: A school can run daily operations**

This is the phase you take to a pilot school. Every feature must be end-to-end usable.

### 1.1 Platform Admin + Tenant Setup (Week 1)
**Backend — `TenantsModule`**
- [ ] `POST /tenants` — create school (Super Admin only)
- [ ] `GET /tenants/:id` — get school profile
- [ ] `PATCH /tenants/:id/settings` — update config (timezone, academic year, etc.)
- [ ] `POST /tenants/:id/users` — provision first School Admin
- Prisma: no new models; populate `Tenant.settings` JSON schema

**Frontend — `/admin` portal (Super Admin)**
- [ ] Create school form
- [ ] School list + status toggle
- [ ] First admin provisioning form

**Done when:** Super Admin can create a tenant and provision its first School Admin via web.

---

### 1.2 User Management (Week 1–2)
**Backend — `UsersModule`**
- [ ] `POST /users` — create user (School Admin only; role-gated)
- [ ] `GET /users` — list users with role filter + pagination
- [ ] `GET /users/:id` — user profile
- [ ] `PATCH /users/:id` — update (name, phone, isActive)
- [ ] `POST /users/:id/reset-password` — admin-triggered reset
- [ ] Password hash on create via `AuthService.hashPassword`

**Frontend — `/school/users` (School Admin)**
- [ ] User list table with role badges
- [ ] Create user drawer (role, email, name, phone)
- [ ] Deactivate/reactivate toggle

**Done when:** School Admin can add teachers, parents, and staff accounts.

---

### 1.3 Student + Family SIS (Week 2–3)
**Backend — `StudentsModule`**
- [ ] `POST /students` — enroll student (links to family)
- [ ] `GET /students` — list with grade/section filter + search by name / admission no
- [ ] `GET /students/:id` — full profile with family
- [ ] `PATCH /students/:id` — update profile / transfer grade
- [ ] `POST /families` — create family record
- [ ] `POST /families/:id/members` — link parent User to family
- [ ] `GET /families/:id/students` — all children in family

**Frontend — `/school/students`**
- [ ] Student list (searchable, filterable by grade)
- [ ] Student profile page (personal, family, enrollment details)
- [ ] Enroll student wizard (create/link family → add student)
- [ ] Family profile page showing all children + parent contacts

**Done when:** Admin can enroll a student, link their parents, and view the family record.

---

### 1.4 Attendance (Week 3–4)
**Backend — `AttendanceModule`**
- [ ] `POST /attendance/mark` — bulk mark for a class on a date (Teacher)
  - Body: `{ date, classId, entries: [{ studentId, status, note }] }`
  - Upsert (idempotent re-marking)
- [ ] `GET /attendance/class/:grade/:section` — daily register view
- [ ] `GET /attendance/student/:studentId` — student history with date range
- [ ] `GET /attendance/report` — class-level summary (present%, absent count per student)
- Domain event: emit `student.marked_absent` to queue when status = ABSENT → triggers notification Phase

**Frontend — `/teacher/attendance`**
- [ ] Date picker + class selector
- [ ] Register grid (student name, P/A/L/E toggle per row)
- [ ] Submit confirmation + lock (can re-open within same day)
- [ ] Student attendance history card (calendar view)

**Frontend — `/school/attendance`** (Admin view)
- [ ] Class-level report table
- [ ] Export to CSV

**Done when:** Teacher can mark a full class register in < 2 minutes. Admin sees today's absent count.

---

### 1.5 Parent Portal — Read-Only MVP (Week 4–5)
**Backend**
- [ ] `GET /parent/children` — list own children (from FamilyMember)
- [ ] `GET /parent/children/:studentId/attendance` — attendance summary + calendar
- [ ] `GET /parent/announcements` — school-wide announcements for tenant
- [ ] Guard: Parent role can only access own family's student data

**Frontend — `/parent` portal**
- [ ] Child switcher (if multiple children)
- [ ] Attendance calendar (color-coded P/A/L/E per day)
- [ ] Weekly attendance % card
- [ ] Announcements feed

**Mobile-first:** All parent screens must work on 375px viewport. Test on Chrome DevTools mobile.

**Done when:** Parent logs in, sees their child's attendance this week, and reads latest announcement.

---

### 1.6 Notification Engine — MVP (Week 5–7)

This is foundational. Build it properly; everything else depends on it.

**Backend — `NotificationsModule` (flesh out the stub)**

Queue setup (BullMQ):
- [ ] `notifications:immediate` queue — absence alerts, emergency
- [ ] `notifications:digest` queue — announcements, general
- [ ] `notifications:dead-letter` queue — failed jobs after 3 retries

Core infrastructure:
- [ ] `NotificationService.dispatch(event)` — enqueues job; selects channel based on `TenantNotificationConfig`
- [ ] `NotificationProcessor` (BullMQ worker) — pulls job, calls provider, updates `NotificationEvent` status
- [ ] `NotificationTemplateService` — loads template from DB, substitutes variables
- [ ] `GET /notifications` — user's in-app notification list (paginated)
- [ ] `PATCH /notifications/:id/read` — mark read
- [ ] `GET /notifications/unread-count` — for navbar badge

Prisma additions:
```prisma
model NotificationTemplate {
  id         String   @id @default(cuid())
  tenantId   String
  type       NotificationType
  channel    NotificationChannel
  locale     String   @default("en")
  subject    String?
  bodyHtml   String?
  bodySms    String?
  variables  String[] // e.g. ["studentName", "date"]
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([tenantId, type, channel, locale])
  @@map("notification_templates")
}
```

**3 event triggers to wire up:**
1. `student.marked_absent` → email + in-app to primary parent
2. `school.announcement_created` → in-app to all parents + teachers
3. `school.emergency_broadcast` → email + SMS + in-app to all; bypasses all limits

**Template variables for each trigger:**
| Trigger | Variables |
|---|---|
| Absent | `studentName`, `date`, `grade`, `section`, `schoolName` |
| Announcement | `title`, `body`, `schoolName`, `postedBy` |
| Emergency | `message`, `schoolName`, `timestamp` |

**Frontend — in-app notification center**
- [ ] Navbar bell icon with unread count badge
- [ ] Notification dropdown (last 10, mark all read)
- [ ] Full notification page (paginated, filter by type)

**Done when:** When a teacher marks a student absent, the parent receives an email within 60 seconds and sees an in-app notification on login.

---

### 1.7 AI — Phase 1 Co-pilots (Week 7–8)

Human-in-the-loop always. Drafts only, never auto-send.

**Backend — flesh out `AiService`**
- [ ] `POST /ai/absence-draft` — teacher clicks "Draft message to parent"; returns draft; teacher edits + approves
  - Input: `{ studentId, date, attendanceEventId }`
  - Output: `{ draft: string, isAiDraft: true }`
  - On approval: creates `NotificationEvent` with `isAiDraft: true, approvedBy: userId`
- [ ] `POST /ai/weekly-summary/:studentId` — called by cron (Friday 5pm) or teacher trigger
  - Aggregates 5-day attendance + any notes
  - Output: draft summary; queued to parent with `isAiDraft: true`
- [ ] Graceful degradation: if `AI_PROVIDER=disabled` or `isEnabled === false`, return `null`; UI shows manual-compose fallback

**Frontend**
- [ ] Teacher attendance view: "Draft message to parent" button per absent row
- [ ] Draft review modal: AI text + editable textarea + Send / Discard
- [ ] Parent portal: weekly summary card (shows "AI summary" label + disclaimer)

**Done when:** Teacher marks student absent → clicks draft → reviews AI text → sends. Parent receives it with "AI-assisted" label.

---

### Phase 1 — Definition of Done

A pilot school with 3 teachers, 100 students, and 200 parents can:
- [ ] Log in from their role's portal
- [ ] Mark and view attendance daily
- [ ] Parents see real-time absence alerts (< 2 min)
- [ ] School Admin post announcements
- [ ] No cross-tenant data leakage (manual test: two tenants, verify isolation)
- [ ] Works on mobile browser (375px)
- [ ] `pnpm test` passes (unit tests for AttendanceService, AuthService, NotificationProcessor)

---

## Phase 2 — Communication & Teacher Tools
**Duration: ~8 weeks | Goal: Teachers adopted. Parents engaged daily.**

### 2.1 Assignments & Basic Gradebook (Week 9–10)
**New Prisma models:** `Assignment`, `Submission`, `Grade`
- [ ] Teacher: create assignment (title, description, due date, class, subject)
- [ ] Student/Parent: view assignments + due dates
- [ ] Teacher: mark submissions as received, enter grade/score
- [ ] Parent: see child's grades per subject
- [ ] Trigger: `assignment.due_tomorrow` → in-app notification to student/parent (Day -1)

### 2.2 Full Notification Engine (Week 10–12)
- [ ] SMS pipeline: MSG91 (India) + Twilio (global), DLT template ID support
- [ ] Push notifications: FCM device token registration, deep-link payloads
- [ ] Digest engine: user configures immediate / daily / weekly per category
- [ ] DND (Do Not Disturb): quiet hours config, emergency bypass
- [ ] Fallback chain: email → SMS → in-app escalation on non-read
- [ ] Preference center: `/parent/settings/notifications`
- [ ] Rate limiting: fee reminder max once/24h per student per family
- [ ] 5th trigger: `fee.overdue` (day 0, +3, +7)

### 2.3 Parent–Teacher Messaging (Week 12–13)
**New Prisma model:** `Message`, `MessageThread`
- [ ] Thread per student (parent ↔ teacher/admin)
- [ ] Real-time via WebSocket (in-app only; no SMS for chat)
- [ ] AI: teacher gets "Suggest reply" button → draft → edit → send
- [ ] Sentiment analysis: flag urgent/negative threads for principal

### 2.4 Timetable (Week 13–14)
**New Prisma model:** `Period`, `Timetable`
- [ ] Admin: create weekly timetable (class, subject, teacher, period slot)
- [ ] Teacher: see daily schedule
- [ ] Student/Parent: see weekly schedule
- [ ] Link to attendance: auto-populate class list when teacher marks attendance

### 2.5 Teacher Portal — Dashboard (Week 14–15)
- [ ] Today's schedule (from Timetable)
- [ ] Pending attendance to mark (red if overdue)
- [ ] Recent parent messages
- [ ] Class performance quick view (avg attendance %, avg grade)
- [ ] AI weekly class summary: "3 students missed > 3 days this week; 2 assignments overdue"

### 2.6 Announcements & Notice Board (Week 15–16)
- [ ] Admin creates announcement (title, body, target: all / grade / class / role)
- [ ] Attach file (upload to S3/MinIO)
- [ ] Priority: Normal / Urgent (urgent → immediate channel, not digest)
- [ ] Parent portal notice board (sorted by date, unread indicator)
- [ ] Delivery analytics: admin sees read count per announcement

### Phase 2 — Definition of Done
- [ ] Teacher completes daily workflow (mark attendance → check messages → view grades) in < 5 min
- [ ] Parent receives SMS + push for absences (not just email)
- [ ] Notification preference center working end-to-end
- [ ] 0 AI auto-sends without human approval

---

## Phase 3 — Finance & Administration
**Duration: ~8 weeks | Goal: School operations fully digitized. Revenue-generating for you (fee module = stickiness).**

### 3.1 Fee Management (Week 17–19)
**New Prisma models:** `FeeStructure`, `FeeInvoice`, `FeePayment`
- [ ] Admin: define fee structure per grade per term (tuition, transport, activity, etc.)
- [ ] Auto-generate invoices at term start for all active students
- [ ] Payment recording: manual (offline cash/cheque), online (Razorpay / Stripe integration)
- [ ] Overdue tracking + notification triggers (already wired in Phase 2)
- [ ] Parent portal: fee summary, invoice download (PDF), payment history
- [ ] Reports: collection summary, outstanding by grade, overdue ledger

**Note on payments:** Start with offline recording only (manual entry by admin). Add Razorpay/Stripe gateway in Phase 3 week 2 — don't block the rest of fee management on gateway integration.

### 3.2 Admissions (Week 19–20)
**New Prisma model:** `AdmissionApplication`
- [ ] Public application form (unauthenticated, linked to tenant domain)
- [ ] Admin review queue: view applications, change status (Applied → Reviewed → Offered → Enrolled → Rejected)
- [ ] On Enrolled: auto-create Student + Family + parent User account
- [ ] Notification: application received, offer letter, enrollment confirmation

### 3.3 Academic Calendar (Week 20–21)
**New Prisma model:** `CalendarEvent`
- [ ] Admin: define academic year, terms, holidays, exam periods, events
- [ ] Calendar visible in all portals
- [ ] Holidays auto-excluded from attendance calculations
- [ ] Exam period indicator (UI hint to teachers)

### 3.4 Report Cards (Week 21–22)
- [ ] Admin defines grade scale and report card template per grade
- [ ] Teacher enters term-end grades + remarks per student per subject
- [ ] Generated report card PDF (per student, per term)
- [ ] Parent portal: download report card
- [ ] AI: `POST /ai/report-card-remark` — drafts teacher remark for a student; teacher reviews + approves

### 3.5 Analytics Dashboard — Phase 1 (Week 22–24)
**Admin dashboard:**
- [ ] Key cards: total students, today's attendance %, fee collection %, active teachers
- [ ] Attendance trend chart (30-day, by grade)
- [ ] Fee collection funnel (invoiced → paid → overdue)
- [ ] Late/absent alert feed (today's absences with parent notification status)
- [ ] Grade distribution per class (boxplot or bar)

**No external BI tool.** Build with Recharts / Victory directly in React. Data from aggregation queries on existing tables.

### Phase 3 — Definition of Done
- [ ] Admin can generate fee invoices, record a payment, and download a receipt
- [ ] Admissions form accessible without login; submitted applications appear in admin queue
- [ ] Report card PDF generated correctly for at least one student
- [ ] Analytics dashboard loads in < 2s (add DB indexes if needed)

---

## Phase 4 — AI Intelligence Layer
**Duration: ~6 weeks | Goal: AI becomes genuinely useful, not a demo.**

All AI features: draft-first, human-approved, graceful fallback if disabled.

### 4.1 Smart Notification Prioritization (Week 25–26)
- [ ] Claude scores each notification event: urgency (1–5), impact, context
- [ ] Immediate vs digest routing based on score (not just category)
- [ ] Score + reason text visible to admin in notification health dashboard
- [ ] Fallback: rule-based routing when AI disabled

### 4.2 Absence Pattern Detection (Week 26–27)
- [ ] Weekly job: scan students with > 3 absences in rolling 10 days
- [ ] Claude generates intervention suggestion for teacher: "Rahul has missed 4 of last 5 Mondays — possible pattern"
- [ ] Teacher sees flag on student profile; can dismiss or create follow-up note
- [ ] Never surfaces to parent without teacher review

### 4.3 Parent Message Intelligence (Week 27–28)
- [ ] Incoming parent messages → Claude sentiment + urgency classification
- [ ] Urgent/distressed → flag in admin/counselor queue with reason
- [ ] Staff reply drafts: 2 options generated; staff picks, edits, sends
- [ ] Auto-translation: Claude translates teacher message to parent's preferred language (stored in User.settings)

### 4.4 AI Content Validation Gate (Week 28–29)
- [ ] Pre-send check on all AI-generated content before it enters the notification queue:
  - PII leakage check (student names outside intended recipient, phone numbers, etc.)
  - Factual check (AI-generated values cross-checked against DB)
  - Tone check (flag aggressive / insensitive language)
- [ ] Blocked content → admin review queue with reason
- [ ] Log all AI decisions in `NotificationEvent.payload`

### 4.5 Weekly Progress Digest (Week 29–30)
- [ ] Scheduled job: Friday 5pm — generate parent digest for each student
- [ ] Aggregates: week's attendance, grades submitted, assignments, teacher notes
- [ ] Claude generates 3-paragraph summary: factual, warm, actionable
- [ ] Optional teacher review gate (School Admin configures: auto-send vs teacher-approve)
- [ ] Delivered as email + in-app; not SMS (length)

### Phase 4 — Definition of Done
- [ ] AI suggestion acceptance rate trackable (stored per event)
- [ ] All AI-generated content has `isAiDraft: true` and `approvedBy` before send
- [ ] Content validation gate blocks at least one intentionally bad test prompt
- [ ] Weekly digest sends on schedule and arrives with correct student data

---

## Phase 5 — Enterprise, Compliance & On-Prem Hardening
**Duration: ~8 weeks | Goal: Sellable to enterprise schools and on-prem districts.**

### 5.1 Consent & DPDP Compliance (Week 31–32)
- [ ] Onboarding consent flow: explicit opt-in per channel per notification category
- [ ] Consent records stored in DB (`NotificationConsent` model)
- [ ] Withdrawal workflow: immediate channel disable + confirmation email
- [ ] Exportable consent audit report (CSV/PDF)
- [ ] DPDP-aligned: purpose-linked data collection records, privacy notice display, acknowledgement tracking
- [ ] Data access / correction / erasure request intake form (DSAR workflow)

### 5.2 Immutable Audit Trail (Week 32–33)
- [ ] Append-only `AuditLog` table (no UPDATE/DELETE, Postgres trigger enforced)
- [ ] Logs: all notification delivery lifecycle events, AI decisions, fallback chain steps, sender identity
- [ ] Admin UI: search + filter audit log, CSV/PDF export
- [ ] Configurable retention per tenant (default 3 years)

### 5.3 Emergency Broadcast (Week 33–34)
- [ ] All-channel simultaneous dispatch (email + SMS + push + in-app)
- [ ] Real-time delivery confirmation dashboard (Principal/Admin sees delivery status live)
- [ ] SMS acknowledgment: reply Y → recorded in system
- [ ] Alternate contact escalation after 15 min non-delivery
- [ ] Authorization: Principal + Admin only; mandatory 2-factor confirm before send
- [ ] Every broadcast creates an immutable audit entry

### 5.4 Full On-Prem Parity (Week 34–36)
- [ ] SMTP OAuth2 + certificate auth support (in addition to Basic)
- [ ] Kannel SMPP provider implementation
- [ ] RabbitMQ queue provider (alternative to Redis/BullMQ)
- [ ] Apache Kafka event bus (alternative to Redis Streams)
- [ ] Helm chart (`infra/helm/vidyaai/`) for Kubernetes deployment
- [ ] Air-gap test: run full stack with `AI_PROVIDER=ollama`, `STORAGE_PROVIDER=minio`, `EMAIL_PROVIDER=smtp`, `SMS_PROVIDER=kannel`, `TELEMETRY_ENABLED=false` — all features must work
- [ ] Upgrade packages: `scripts/upgrade.sh` — pulls new images, runs migrations, restarts services

### 5.5 Multi-School / District (Week 36–38)
- [ ] District tenant type: parent tenant that owns child school tenants
- [ ] District admin sees cross-school analytics (aggregate, no PII cross-school exposure)
- [ ] Benchmarking: attendance %, fee collection rate across schools in district
- [ ] Shared template library: district creates templates; schools can inherit or override

### Phase 5 — Definition of Done
- [ ] On-prem deployment passes air-gap test (no outbound calls except configured SMTP/SMS/AI)
- [ ] Consent withdrawal disables channel within 1 delivery cycle (< 5 min)
- [ ] Audit trail cannot be modified (test with direct DB update attempt → rejected by trigger)
- [ ] Helm chart installs cleanly on a local `kind` cluster

---

## Phase 6 — Strategic Expansion (Backlog, post-traction)
*Build only if you have paying users requesting these.*

- HR & payroll module
- Transport tracking (GPS integration)
- Library management
- Health & safety records
- Advanced AI forecasting (dropout risk, performance prediction)
- Alumni & fundraising
- Hostel/residential workflows
- Marketplace integrations (Google Classroom, Microsoft Teams, Zoom)
- WhatsApp channel (Meta Business API)
- Native mobile apps (React Native) — only after mobile web proves insufficient

---

## Cross-cutting: what to build continuously (every phase)

| Concern | Practice |
|---|---|
| **Tenant isolation** | Every new query: assert `tenantId` filter present. No exceptions. |
| **AI human-in-the-loop** | Every AI output: `isAiDraft: true`. Every send: `approvedBy` required. |
| **Mobile-first** | Every new UI page: test at 375px before marking done. |
| **Provider interfaces** | New email/SMS/AI variant: implement interface, add factory case, add env var to `.env.example`. |
| **On-prem readiness** | Every new external service call: check `DEPLOYMENT_MODE`, add on-prem fallback or graceful disable. |
| **Tests** | Each new service: one happy-path + one auth-bypass test minimum. |
| **Migrations** | Never edit existing migrations. Always `prisma migrate dev --name <description>`. |

---

## Module → Phase mapping (quick reference)

| Module | Phase | NestJS module | Prisma models |
|---|---|---|---|
| Tenants + Auth | 0 ✅ | `AuthModule`, `TenantsModule` | `Tenant`, `User` |
| Students + Families | 1 | `StudentsModule` | `Student`, `Family`, `FamilyMember` |
| Attendance | 1 | `AttendanceModule` | `AttendanceEvent` |
| Notifications core | 1 | `NotificationsModule` | `NotificationEvent`, `NotificationTemplate`, `TenantNotificationConfig` |
| AI co-pilots v1 | 1 | `AiModule` | — |
| Assignments + Grades | 2 | `AssignmentsModule` | `Assignment`, `Submission`, `Grade` |
| Messaging | 2 | `MessagingModule` | `Message`, `MessageThread` |
| Timetable | 2 | `TimetableModule` | `Period`, `Timetable` |
| Notifications full | 2 | (extend) | `NotificationPreference`, `DeviceToken` |
| Fee management | 3 | `FeesModule` | `FeeStructure`, `FeeInvoice`, `FeePayment` |
| Admissions | 3 | `AdmissionsModule` | `AdmissionApplication` |
| Academic calendar | 3 | `CalendarModule` | `CalendarEvent` |
| Report cards | 3 | `ReportCardsModule` | `ReportCard`, `ReportCardEntry` |
| Analytics | 3 | `AnalyticsModule` | — (aggregation queries) |
| AI intelligence | 4 | (extend AiModule) | — |
| Consent + DPDP | 5 | `ComplianceModule` | `NotificationConsent`, `DsarRequest` |
| Audit trail | 5 | `AuditModule` | `AuditLog` |
| Emergency broadcast | 5 | (extend NotificationsModule) | `BroadcastEvent` |
| District | 5 | `DistrictModule` | `District`, extend `Tenant` |

---

## Tech decisions locked (do not revisit until Phase 3+)

| Decision | Locked choice | Revisit trigger |
|---|---|---|
| ORM | Prisma | Never (unless Prisma drops TS support) |
| Auth | JWT flat-role enum | Only if enterprise customer needs SAML/SSO |
| Queue | BullMQ + Redis | Only if on-prem customer requires RabbitMQ (Phase 5) |
| Frontend | Vite + React + shadcn/ui | Only if SSR/SEO needed for public pages |
| Mobile | Responsive web only | Only when > 500 MAU parents complain about mobile UX |
| Database isolation | Shared DB + tenant_id | Upgrade to schema-per-tenant when first enterprise on-prem customer signs |
