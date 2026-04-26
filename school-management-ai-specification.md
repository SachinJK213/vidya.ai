# VidyaAI — AI-First School Management Platform Specification

## 1. Document Purpose

This document defines the product specification for an AI-first school management platform designed for K-12 schools. It combines:

- core school operations
- academic management
- finance and administration
- parent engagement
- teacher productivity
- regulatory and government reporting
- management analytics
- student support and safety
- AI-driven automation and intelligence

The goal is not to build "another school ERP", but to design a platform that fixes the biggest gaps in current school management solutions.

## 2. Vision

Build a unified platform that helps a school run daily operations, improve learning outcomes, reduce teacher/admin workload, increase parent trust, and stay compliant with board, district, and government requirements.

## 3. Problem Statement

Most current school management systems solve only part of the problem:

- SIS products handle records, attendance, grades, and schedules.
- LMS products handle classroom workflows and assignments.
- ERP products handle fees, accounting, payroll, and inventory.
- Communication apps handle messages, notices, and alerts.
- Separate tools handle transport, library, admissions, health, and compliance.

As a result, schools face:

- duplicate data entry
- poor interoperability between systems
- inconsistent parent experience
- teacher overload from fragmented tools
- delayed or inaccurate reporting
- limited decision intelligence for leadership
- weak support for personalized interventions
- compliance risk around privacy, consent, and data sharing
- AI features that are shallow, generic, or disconnected from actual school workflows

## 4. Product Positioning

### 4.1 What This Product Should Be

- a unified school operating system
- modular, so schools can adopt it in phases
- role-based, so each stakeholder sees only what matters
- workflow-driven, not form-driven
- compliance-ready, not compliance-afterthought
- AI-assisted, but human-controlled
- mobile-first for parents and teachers
- integration-ready through standard APIs and education data standards

### 4.2 What This Product Should Not Be

- only a digital register
- only a billing system
- only a classroom app
- only a chatbot layer on top of old workflows
- a one-country hardcoded product with no regulatory flexibility

## 5. Key Stakeholders and Their Needs

## 5.1 Students

Needs:

- clear timetable and academic calendar
- assignments, homework, exams, and results in one place
- attendance visibility
- transport and safety updates
- learning support and study planning
- counseling and wellbeing support
- easy communication with teachers and school

Pain points in current systems:

- too many portals
- missing-work visibility is poor
- no personalized study guidance
- low engagement outside exam periods

## 5.2 Parents and Guardians

Needs:

- real-time updates on attendance, homework, marks, behavior, fees, transport, and events
- one app for all children
- multilingual communication
- transparent fee and payment status
- actionable alerts, not notification spam
- easy leave requests, approvals, and document submission
- clear consent and privacy controls for child data
- confidence that data is secure and used responsibly

Pain points in current systems:

- too many notifications with low signal
- delayed academic insights
- weak visibility into actual child progress and risk
- poor support for separated guardians, permissions, and emergency contacts
- multiple apps for academics, fees, transport, and communication

## 5.3 Teachers

Needs:

- fast attendance and grade entry
- assignment and assessment management
- lesson planning
- classroom communication
- behavior and intervention logging
- AI help for routine admin work
- student insights without manual data hunting

Pain points in current systems:

- repeated data entry across tools
- weak integration between gradebook, LMS, and communication
- too many clicks for simple workflows
- poor visibility into at-risk students
- no smart prioritization of students needing intervention

## 5.4 School Management and Leadership

Needs:

- holistic view of operations, academics, finance, staffing, and risk
- admissions funnel visibility
- fee collection and financial forecasting
- teacher workload and productivity insights
- compliance dashboards
- early warning systems for churn, dropout, absenteeism, and academic decline
- reputation and parent satisfaction tracking

Pain points in current systems:

- fragmented reporting
- weak forecasting
- too much dependence on Excel exports
- low trust in data quality
- delayed decisions because dashboards are descriptive, not actionable

## 5.5 Administrative Staff

Needs:

- smooth admissions and onboarding
- records management
- certificates, IDs, and documents
- timetable and room allocation
- transport, inventory, and vendor operations
- fee reconciliation
- payroll and HR coordination

Pain points in current systems:

- repetitive manual processes
- inconsistent approval workflows
- hard-to-track exceptions
- disconnected document and record management

## 5.6 Government Bodies / Boards / Districts / Regulators

Needs:

- accurate enrollment and attendance reporting
- audit-ready student records
- standardized reporting formats
- compliance with data privacy and consent laws
- incident, safety, and child-protection reporting
- data interoperability for district/state/national systems
- outcome and equity reporting

Pain points in current systems:

- non-standard exports
- late submissions
- poor data lineage and audit trails
- inconsistent student identity and transfer data
- compliance handled manually at school level

## 5.7 Super Admin / Platform Owner

Needs:

- manage multiple tenants, school groups, and subscription plans
- onboard new schools quickly
- define platform-wide configurations and policies
- monitor usage, health, billing, and support issues across tenants
- control marketplace integrations, AI usage policies, and feature flags

Pain points in current systems:

- weak multi-tenant governance
- poor tenant provisioning workflows
- low observability into usage and issues
- no central control for compliance or feature rollout

## 5.8 Tenant Admin / School Group Admin

Needs:

- configure schools, branches, academic structures, and branding
- manage roles, permissions, academic years, fee structures, and workflows
- see group-level dashboards across multiple schools
- manage data quality, audit readiness, and operational consistency

Pain points in current systems:

- inconsistent setup across schools
- difficult centralized oversight
- heavy dependence on vendor support for configuration changes

## 5.9 Principal / Head of School

Needs:

- daily visibility into attendance, discipline, teaching coverage, fee collection, incidents, and academic health
- action center for exceptions and escalations
- school-level trend and benchmark dashboards
- meeting, observation, and intervention follow-through

Pain points in current systems:

- too many reports, too little prioritization
- no single daily command center
- weak linkage between issue detection and corrective action

## 5.10 Coordinators / HODs / Academic Leads

Needs:

- subject/grade-level academic monitoring
- lesson coverage tracking
- teacher review workflows
- exam readiness and moderation oversight
- student risk clusters by class, subject, and teacher

Pain points in current systems:

- fragmented academic visibility
- limited cross-class or cross-teacher comparison
- reactive rather than proactive intervention workflows

## 5.11 Finance Staff

Needs:

- fee operations dashboard
- dues tracking and collections workflow
- reconciliation queue
- scholarship, waiver, refund, and exception handling
- branch-wise cash flow visibility

Pain points in current systems:

- manual reconciliation
- weak exception management
- poor parent communication coordination

## 5.12 HR / Operations Staff

Needs:

- staff attendance and leave tracking
- recruitment and onboarding pipeline
- payroll readiness dashboard
- maintenance, transport, and vendor operations visibility

Pain points in current systems:

- siloed HR and operations data
- no shared operational dashboard
- too much manual follow-up

## 6. Core Product Principles

1. Single student profile:
Every operational, academic, financial, wellbeing, and compliance event should connect to one student record.

2. AI as co-pilot, not auto-pilot:
AI should recommend, summarize, detect risk, and draft actions, but final control remains with authorized humans.

3. Workflow over forms:
The platform should guide users through complete tasks such as "admit student", "close monthly attendance", "collect overdue fee", or "submit compliance report".

4. Role and context awareness:
The same data should appear differently for parents, teachers, office staff, and management.

5. Configurable compliance:
The platform should support different boards, regions, fee rules, attendance rules, report formats, and consent models.

6. Integration first:
The platform must be API-first and support common education interoperability standards where relevant.

7. Privacy by design:
The platform should treat student, parent, and staff data as sensitive by default and expose clear consent, notice, access-control, and audit capabilities.

## 6.1 Portal and Role Architecture

The platform should not be a single generic login with minor UI changes. It should provide clearly separated portals and role experiences.

### Core Portals

- Super Admin Portal
- Tenant Admin Portal
- Principal / Leadership Portal
- Teacher Portal
- Staff Portal
- Finance Portal
- Parent Portal
- Student Portal
- Government / Auditor / Inspector Access Portal

### Portal Design Principles

- each portal should open with a role-specific dashboard
- each portal should expose only relevant modules, actions, and alerts
- each portal should support desktop and mobile responsive experiences
- parent and student experiences should be mobile-first
- school leadership and back-office portals should optimize for operational decision making
- all portals should support strong permissions, delegated access, impersonation controls for support, and audit trails

### Access Model

- role-based access control for standard permissions
- attribute-based access for branch, grade, class, subject, child, or region-specific restrictions
- temporary delegated access for acting roles such as substitute teachers or temporary principals
- maker-checker approvals for sensitive actions
- restricted visibility for counseling, health, disciplinary, and child-protection records
- privacy-aware access for guardian, child, and sensitive personal data workflows

## 6.1.1 Role-Based Access Control Specification

Because this platform supports many portals and many user types, RBAC must be treated as a core product capability.

### RBAC goals

- ensure users only see data required for their role
- separate global, tenant, school, and class-level powers
- protect sensitive student, family, health, finance, and staff data
- support approvals, delegation, and temporary access
- create a clear audit trail for every access-sensitive action

### Permission layers

- platform-level permissions
- tenant/group-level permissions
- school-level permissions
- department/grade/class-level permissions
- module-level permissions
- action-level permissions such as view, create, edit, approve, export, delete
- field-level restrictions for sensitive fields

### Permission actions

- `view`
- `create`
- `edit`
- `approve`
- `publish`
- `message`
- `download`
- `export`
- `delete`
- `assign`
- `configure`
- `impersonate` for authorized support use only
- `schedule_report`

### Access scopes

- all tenants
- assigned tenant only
- all schools within tenant
- assigned school only
- assigned grades/sections only
- assigned subjects only
- assigned students only
- own child only
- own records only

### Reporting and download permissions

Report access should be permission-controlled separately from simple record viewing.

Examples:

- a teacher may view class grades but not export school-wide grade data
- a principal may download school reports but not cross-tenant reports
- a tenant admin may access aggregated multi-school reports within that tenant
- a super admin may access cross-tenant platform analytics only where business and privacy policy allow

Recommended permission flags:

- `view_dashboard`
- `view_report`
- `download_pdf`
- `download_excel`
- `download_csv`
- `schedule_report`
- `share_report`
- `view_cross_school_reports`
- `view_cross_tenant_reports`

### Sensitive data controls

Sensitive data should have extra restrictions, masking, or explicit approvals.

Examples:

- student health and medication data
- counseling notes
- child protection cases
- disciplinary investigations
- financial hardship or scholarship records
- staff payroll and HR files
- parent identity documents
- AI conversation logs involving personal data

### Approval-sensitive actions

The following should support maker-checker or approval workflows where relevant:

- fee waivers and refunds
- grade changes after publish
- attendance corrections after lock
- student transfer and withdrawal
- access to child-protection records
- deletion or bulk export of personal data
- role elevation
- policy/configuration changes

### Authentication and session requirements

- role-aware login experience
- SSO support for institutions where required
- MFA for super admin, tenant admin, finance, HR, and sensitive roles
- device/session tracking
- forced logout on high-risk events
- session timeout policies by role

### Audit expectations

- log login, logout, failed login, and MFA events
- log permission changes and role assignments
- log record views for highly sensitive modules where needed
- log exports, downloads, and bulk actions
- support periodic access review reports

### Suggested default roles

- Super Admin
- Support Admin
- Tenant Admin
- School Admin
- Principal
- Vice Principal
- Academic Coordinator / HOD
- Homeroom Teacher
- Subject Teacher
- Admission Officer
- Registrar
- Finance Officer
- Accountant
- HR Officer
- Librarian
- Transport Manager
- Nurse
- Counselor
- Parent / Guardian
- Student
- Auditor / Inspector

### Role design note

- roles should be configurable, but the platform should ship with strong default templates
- schools should be able to clone and customize roles without breaking core security boundaries

## 6.2 Dashboard Strategy

Dashboards should be role-specific, action-oriented, and time-aware.

Every dashboard should include:

- KPI summary cards
- exceptions requiring attention
- trend views
- drill-down capability
- saved filters
- export/share options subject to permission
- AI-generated summary of what changed and what matters

Dashboards should support:

- today view
- this week view
- this month / term view
- custom date range
- benchmark view where applicable

## 6.3 Role-Wise Portals and Dashboards

### 6.3.1 Super Admin Portal

Purpose:

- manage the entire platform business and operations across all tenants

Key modules:

- tenant lifecycle management
- subscription and billing
- feature flags
- platform configuration
- support and ticket monitoring
- uptime and integration monitoring
- audit and security center

Dashboard widgets:

- active tenants
- new tenant onboarding status
- monthly active users by role
- feature adoption by tenant
- support ticket volume and SLA status
- payment/subscription health
- failed integrations and sync jobs
- security alerts and audit anomalies
- AI usage volume and policy exceptions
- tenant-wise report usage and download activity

Key actions:

- create or suspend tenant
- enable/disable modules
- manage pricing plans
- push global templates and policy updates
- investigate audit and integration issues
- view platform-wide analytics and report adoption trends

### 6.3.2 Tenant Admin Portal

Purpose:

- configure and govern one tenant, school chain, or education group

Key modules:

- school setup
- academic structure
- user and role management
- workflow configuration
- branding and communication settings
- data governance
- integrations
- AI configuration

Dashboard widgets:

- schools by status
- user provisioning status
- unassigned roles or access issues
- data quality score
- configuration gaps
- pending approvals across schools
- school-wise attendance and fee snapshot
- audit readiness status
- integration health
- scheduled report status across schools
- failed report jobs and export exceptions

Key actions:

- create schools and branches
- assign principals and admins
- configure academic years and policies
- manage group-level dashboards
- review compliance and data-quality exceptions
- configure tenant-wide report packs and delivery rules

### 6.3.3 Principal / Head of School Portal

Purpose:

- run the school daily from one leadership command center

Key modules:

- school operations dashboard
- academics
- attendance
- discipline and wellbeing
- fees snapshot
- staff and substitution
- compliance
- communication center

Dashboard widgets:

- today attendance by class and grade
- absent staff and substitution gaps
- students at academic risk
- students at attendance risk
- serious discipline or health incidents
- overdue fees summary
- open parent escalations
- lesson coverage completion
- upcoming inspections, events, and deadlines

Key actions:

- approve key workflows
- escalate interventions
- assign follow-up to coordinators or staff
- broadcast urgent messages
- review daily AI summary and recommendations

### 6.3.4 Academic Coordinator / HOD Portal

Purpose:

- monitor teaching quality and academic progress by grade, subject, or department

Dashboard widgets:

- syllabus completion by class/teacher
- assignment completion rates
- class performance comparison
- low-performing concepts
- grading delays
- moderation pending items
- teacher feedback follow-ups
- at-risk student groups by subject

Key actions:

- review lesson plans
- assign academic interventions
- monitor exam readiness
- support teacher coaching

### 6.3.5 Teacher Portal

Purpose:

- help teachers complete classroom work with minimal friction

Key modules:

- timetable
- attendance
- lesson planner
- assignments and gradebook
- behavior/intervention
- parent communication
- student profiles

Dashboard widgets:

- today's classes
- pending attendance
- assignments to grade
- missing submissions
- students needing follow-up
- behavior notes requiring action
- parent messages
- upcoming assessments

Key actions:

- mark attendance
- post homework
- enter grades
- log behavior or intervention notes
- message parents
- use AI for lesson and feedback drafting

### 6.3.6 Staff Portal

Purpose:

- support non-teaching school operations

Relevant staff roles:

- front office
- registrar
- admission staff
- librarian
- transport manager
- nurse
- counselor
- maintenance staff

Dashboard pattern:

- task queue
- pending approvals
- service requests
- due follow-ups
- role-specific alerts

Examples:

- registrar dashboard: transfer requests, missing documents, certificate requests
- librarian dashboard: overdue books, new issue requests, damaged inventory
- transport dashboard: route delays, vehicle assignment issues, safety alerts
- nurse dashboard: medication due, high-risk medical alerts, recent visits

### 6.3.7 Finance Portal

Purpose:

- centralize fee and accounting operations

Dashboard widgets:

- collection today
- overdue dues by bucket
- payment failures
- concessions and waivers pending
- refunds pending
- branch-wise fee performance
- reconciliation mismatches
- forecast vs actual collection

Key actions:

- send reminders
- approve adjustments
- reconcile payments
- export accounting reports

### 6.3.8 Parent Portal

Purpose:

- give families one simple, trusted, actionable view

Key modules:

- child dashboard
- attendance
- assignments
- marks and report cards
- fees and payments
- transport
- announcements
- leave requests
- meetings and communication
- documents and consent

Dashboard widgets:

- today’s attendance status
- homework due soon
- recent marks and teacher comments
- fee due and payment links
- bus live status or route updates
- school announcements ranked by urgency
- upcoming meetings, exams, and events
- AI weekly child summary

Key actions:

- pay fees
- submit leave request
- upload documents
- acknowledge notices
- message teacher or office
- manage multiple children from one account

### 6.3.9 Student Portal

Purpose:

- help students organize learning and school life

Dashboard widgets:

- today’s schedule
- homework due
- missing submissions
- upcoming exams
- attendance summary
- latest results
- teacher feedback
- learning recommendations

Key actions:

- submit assignments
- view timetable
- track progress
- access study support

### 6.3.10 Government / Inspector / Auditor Portal

Purpose:

- provide controlled access for oversight, inspection, and reporting

Dashboard widgets:

- submission status by report type
- school compliance score
- open audit observations
- enrollment and attendance summaries
- incident reporting summaries
- missing or late returns

Key actions:

- review submitted reports
- request clarification
- download approved extracts
- record inspection observations

## 6.4 Dashboard Types Across the Product

The platform should support multiple dashboard categories:

- executive dashboards
- operational dashboards
- academic dashboards
- finance dashboards
- compliance dashboards
- wellbeing and risk dashboards
- communication and engagement dashboards
- transport and facility dashboards

Each category should have:

- overview dashboard
- detail dashboard
- exception dashboard
- trend dashboard

## 6.4.1 Reporting, Download, and Distribution Capability

The platform should support rich reporting beyond on-screen dashboards.

### Report types

- operational reports
- academic reports
- attendance reports
- fee and finance reports
- HR and payroll reports
- compliance and audit reports
- transport and safety reports
- admissions reports
- communication and engagement reports
- AI usage and productivity reports

### Report formats

- PDF
- Excel
- CSV
- print-friendly view

Optional later:

- API-based report extraction
- BI connector / data warehouse export

### Download options

- immediate download from dashboard or report center
- filtered report download
- summary-only download
- detailed row-level download
- school-wise grouped download
- branch-wise grouped download
- combined pack download for selected modules

### Scheduled delivery options

- daily
- weekly
- monthly
- term-wise
- custom recurring schedule

Delivery channels:

- in-app inbox
- email attachment or secure link
- admin report center archive

### Report governance

- role-based access to report templates
- tenant-level control over which reports are enabled
- watermarking for sensitive exports
- password-protected downloads for high-sensitivity files
- expiry-based download links
- download history and audit logs
- approval flow for high-risk bulk exports

### Multi-tenant reporting model

- super admin can view platform-level analytics across tenants
- tenant admin can view multi-school analytics within their own tenant
- school leaders can view school-level reports only
- no tenant should see another tenant's operational data unless explicitly configured for a group ownership model

### Report center requirements

The product should include a centralized report center with:

- report catalog
- favorite reports
- recent downloads
- scheduled reports
- saved report filters
- failed job retry
- role-based recommended reports
- report usage analytics

## 6.5 Command Center and Action Center

Beyond dashboards, every major admin-facing portal should include an action center.

Action center capabilities:

- pending approvals
- overdue tasks
- high-risk alerts
- unresolved incidents
- AI recommendations ranked by urgency and confidence
- task assignment and follow-up tracking

This solves a major gap in current systems where dashboards show data but do not help users act.

## 6.6 Notifications, Inbox, and Calendar Layer

Every portal should include:

- notification center
- task inbox
- shared calendar integration
- reminders
- communication history

Notifications should be:

- priority-scored
- role-aware
- grouped to avoid spam
- traceable to source events

### 6.6.1 Notification Channels

The platform must support the following delivery channels:

- in-app notification center (all portals, all deployment modes)
- email (transactional and digest)
- SMS (transactional and emergency)
- mobile push notifications (Android and iOS)
- WhatsApp (opt-in, for supported deployments via Meta Business API)

Each channel is independently configurable per tenant. Users set preferences per channel per notification category.

### 6.6.2 Delivery Behavior Requirements

- delivery fallback chain: if primary channel fails or message is unread past a configurable window, escalate to next channel automatically
- digest mode: batch low-priority notifications into hourly, daily, or weekly digest emails; high-priority always bypasses
- do not disturb windows: users configure quiet hours; non-urgent notifications queue until window ends; time-zone aware
- emergency override: emergency-type notifications bypass DND, digest, throttle, and opt-out settings across all active channels simultaneously
- retry logic: failed delivery retried with exponential backoff (3 attempts: 1m → 5m → 30m) before escalating to fallback channel
- rate limiting: per-recipient per-type frequency caps to prevent notification spam

### 6.6.3 Notification Preferences and Consent

- users configure channel preferences per notification category at account setup and via a self-service preference center
- explicit opt-in required before first send via SMS, WhatsApp, and push channels
- consent records stored with timestamp, IP, notice version, channel, and scope (DPDP and GDPR aligned)
- users can withdraw consent at any time; platform honors it immediately
- mandatory notification categories (emergency, system security) cannot be fully opted out
- admin cannot override user consent withdrawal except for mandatory categories
- preference center accessible from all portals; changes take effect within one delivery cycle

### 6.6.4 Deployment-Aware Delivery

- SaaS: platform-managed providers (AWS SES / SendGrid / Mailgun for email; Twilio / MSG91 for SMS; FCM for push); tenant isolation via dedicated sender domains and sender IDs
- MicroSaaS: tenant-supplied provider credentials; same feature surface with cost-optimized routing
- On-Prem: customer-supplied SMTP relay (Exchange, Postfix, Google Workspace SMTP) and SMS gateway (Kannel SMPP, local telecom aggregator HTTP); no external notification API dependency required; all processing stays within customer network perimeter

## 6.7 Portal-Specific UX Expectations

- Super Admin and Tenant Admin portals should optimize for configuration, governance, and observability.
- Principal and leadership portals should optimize for action, exceptions, and quick drill-downs.
- Teacher portals should optimize for speed, minimal clicks, and class flow.
- Parent and student portals should optimize for simplicity, clarity, and mobile usage.
- Staff portals should optimize for task queues and workflow completion.

## 6.8 Role Hierarchy and Delegation Model

Suggested role hierarchy:

- Platform Super Admin
- Platform Support Admin
- Tenant Owner / Group Admin
- School Admin
- Principal / Head of School
- Vice Principal / Coordinator / HOD
- Teacher
- Class Teacher / Homeroom Teacher
- Finance Officer
- Admission Officer
- Registrar
- Librarian
- Transport Manager
- Nurse / Counselor
- Parent / Guardian
- Student
- Auditor / Inspector

Delegation requirements:

- acting principal assignment during leave
- substitute teacher class access
- temporary finance approval authority
- read-only inspection access with expiry
- emergency override with audit logging

## 7. Functional Modules

## 7.1 Foundation and Platform Administration

Features:

- multi-school / trust / district support
- campus, branch, and academic year setup
- role-based access control
- custom role template builder
- permission matrix management
- scope-based access assignment
- user provisioning and SSO
- configurable workflows and approvals
- localization and multilingual support
- audit logs
- notification engine
- document storage
- master data management
- portal configuration by role
- dashboard builder / widget configuration
- delegated access rules
- impersonation controls for support and audit-safe troubleshooting
- tenant branding and white-label settings
- menu and module visibility controls
- role-wise homepage configuration
- privacy notice and consent template management
- data retention and deletion policy configuration
- grievance / privacy contact configuration
- periodic access review and permission audit reports
- report template management
- report scheduling engine
- export policy controls by role and tenant
- multi-tenant report segregation controls
- report archive retention settings

## 7.2 Admissions and Enrollment

Features:

- inquiry capture
- lead source tracking
- application management
- document checklist
- entrance test and interview scheduling
- merit / selection workflow
- waitlist management
- scholarship and financial aid workflow
- enrollment contract / acceptance flow
- class allocation
- new student onboarding

AI opportunities:

- admission likelihood scoring
- document completeness checks
- automated applicant communication drafts
- seat demand forecasting

## 7.3 Student Information System (SIS)

Features:

- demographic profile
- parent/guardian relationships
- academic history
- student ID and identity management
- class/section allocation
- house/team assignment
- medical profile
- special accommodations
- disciplinary history
- transfer, withdrawal, alumni status
- secure document vault

## 7.4 Attendance Management

Features:

- daily, period-wise, and activity attendance
- late arrivals and early departures
- leave request and approval
- absence reason capture
- biometric / RFID / QR / mobile attendance integration
- transport attendance
- attendance correction workflow
- attendance analytics
- chronic absenteeism alerts

AI opportunities:

- absenteeism risk detection
- anomaly detection for proxy or suspicious patterns
- automated parent follow-up suggestions

## 7.5 Timetable, Scheduling, and Resource Allocation

Features:

- class timetable
- teacher timetable
- room/lab allocation
- substitution management
- exam timetable
- transport route timing alignment
- conflict detection

AI opportunities:

- optimized timetable generation
- substitute teacher recommendations
- room utilization optimization

## 7.6 Curriculum, LMS, and Classroom Management

Features:

- curriculum mapping by board/grade/subject
- lesson planning
- homework and assignments
- content repository
- classroom announcements
- learning objectives and outcomes
- project and practical tracking
- online class links and blended learning support
- grade sync with assessments

AI opportunities:

- lesson plan drafting
- differentiated activity suggestions
- content adaptation by reading level
- multilingual content summaries

## 7.7 Assessment, Exams, and Gradebook

Features:

- formative and summative assessments
- rubrics
- standards/outcome-based grading
- exam scheduling
- marks entry and moderation
- report cards / transcripts
- promotion rules
- rank / percentile / progression analytics
- re-evaluation and correction workflow

AI opportunities:

- automated question paper blueprint support
- rubric-based draft feedback
- performance trend explanation
- weak concept clustering across students

## 7.8 Student Support, Counseling, and Wellbeing

Features:

- counselor referrals
- intervention plans
- behavior logs
- SEL / wellbeing observations
- special education / inclusion support
- medical incidents
- child protection case notes with restricted access
- parent meeting records

AI opportunities:

- early warning system combining attendance, grades, behavior, and engagement
- intervention recommendation engine
- meeting summary generation

## 7.9 Parent Engagement and Communication

Features:

- parent mobile app
- announcements and circulars
- teacher-parent messaging
- meeting scheduling
- homework and progress visibility
- fee reminders
- event participation
- consent capture
- multilingual translation layer
- emergency alerts
- notification preference center accessible from parent portal
- communication history with full delivery audit trail
- delivery status visibility (sent, delivered, read) for sent messages
- two-way acknowledgment for high-priority and emergency alerts
- alternate contact fallback for unacknowledged emergency notifications
- opt-in WhatsApp channel for parents who prefer it over email/SMS

AI opportunities:

- smart notification prioritization based on urgency, context, and parent engagement history
- sentiment analysis on incoming parent messages with urgent-flag escalation
- personalized weekly child progress summaries generated from attendance, grades, homework, and teacher notes
- response drafting suggestions for school staff replying to parent messages
- optimal send-time prediction per parent based on historical engagement patterns
- notification fatigue detection with automatic digest-mode recommendation
- auto-translation to parent's preferred language with variable preservation

## 7.10 Finance and Fee Management

Features:

- fee structure setup
- transport / hostel / activity fees
- invoices and receipts
- online payments
- partial payments and installment plans
- scholarships and waivers
- dues tracking
- refunds
- reconciliation
- parent account statements
- late fee automation

AI opportunities:

- fee default risk prediction
- collection forecasting
- payment reminder optimization

## 7.11 Accounting and Financial Control

Features:

- general ledger
- accounts payable
- accounts receivable
- budgeting
- cash flow tracking
- vendor payments
- fixed assets
- audit support
- branch-wise financial reporting

## 7.12 HR, Payroll, and Staff Lifecycle

Features:

- recruitment workflow
- employee records
- joining and onboarding
- attendance and leave
- payroll
- appraisals
- training and certifications
- substitution eligibility
- exit management

AI opportunities:

- staffing demand forecasting
- attrition risk indicators
- training recommendation engine

## 7.13 Transport Management

Features:

- route planning
- vehicle assignment
- driver and attendant records
- pickup/drop tracking
- GPS integration
- transport attendance
- delay alerts
- maintenance reminders

AI opportunities:

- route optimization
- route safety risk flags
- delay prediction

## 7.14 Library Management

Features:

- catalog
- member accounts
- issue/return
- fines
- digital resource links
- reading history

AI opportunities:

- reading recommendation engine
- literacy engagement insights

## 7.15 Hostel and Residential Management

Features:

- room allocation
- occupancy tracking
- meal planning
- attendance
- health logs
- outing permissions
- visitor management

## 7.16 Inventory, Assets, and Procurement

Features:

- stock management
- issue/return
- purchase requests
- approval workflows
- vendor management
- maintenance tickets
- AMC reminders
- lab and classroom asset tracking

## 7.17 Facilities and Maintenance

Features:

- maintenance requests
- preventive maintenance
- room readiness
- utilities tracking
- cleanliness checklists
- safety inspection records

## 7.18 Health, Safety, and Incident Management

Features:

- infirmary visits
- medication records
- allergy and medical alerts
- emergency contacts
- incident logging
- evacuation drill tracking
- school safety workflows
- mandatory incident reporting

AI opportunities:

- incident pattern detection
- recurring risk hotspot analysis

## 7.19 Compliance, Governance, and Government Reporting

Features:

- board/district/state/national reporting templates
- enrollment returns
- attendance returns
- staff data returns
- finance/compliance checklists
- consent and policy records
- DPDP compliance capability for Indian deployments
- inspection readiness
- audit trails
- document retention rules
- policy acknowledgement tracking

AI opportunities:

- missing-compliance alerting
- draft regulatory submission support
- narrative summary generation for inspections

### DPDP compliance capability showcase:

This product should be able to present DPDP-aligned privacy readiness as a platform capability, especially for India-based schools and school groups.

Expected showcase capabilities:

- consent notice management for parent/guardian-facing data collection flows
- parent / lawful guardian consent workflows for child data where required by policy or deployment context
- purpose-linked data collection and processing records
- privacy notice display and acknowledgement tracking
- data access, correction, and erasure request workflow intake
- grievance / complaint handling workflow
- retention and deletion policy support
- vendor / third-party data-sharing register
- breach and incident logging workflow
- audit trail for who accessed or changed sensitive data

Positioning note:

- this should be described as "DPDP compliance capability" or "DPDP readiness support", not as automatic legal compliance
- the platform should help schools operationalize privacy processes, while legal interpretation and organization-specific compliance remain the responsibility of the institution

## 7.20 Analytics and Executive Intelligence

Features:

- academic dashboards
- admissions funnel dashboards
- fee collection dashboards
- attendance heatmaps
- teacher workload dashboards
- parent engagement dashboards
- risk dashboards
- cross-school benchmarking

AI opportunities:

- natural language analytics
- forecast and scenario planning
- root-cause explanations
- recommended action plans

### Dashboard requirements:

- widget-based configurable dashboards
- role-based default dashboards
- school, grade, class, subject, and date filters
- scheduled report delivery
- drill-through from summary KPI to source records
- benchmark comparisons across branches or time periods
- narrative AI summary for each dashboard
- threshold-based alerting from dashboard metrics
- one-click export from authorized widgets and reports
- report pack generation for leadership reviews
- tenant-level and school-level report partitioning

### Standard dashboard packs:

- super admin dashboard pack
- tenant admin dashboard pack
- principal dashboard pack
- teacher productivity dashboard pack
- finance dashboard pack
- attendance dashboard pack
- academic performance dashboard pack
- parent engagement dashboard pack
- compliance dashboard pack
- transport and safety dashboard pack

### Standard report packs:

- daily principal report pack
- weekly academic review pack
- monthly fee collection pack
- attendance exception pack
- admissions funnel pack
- compliance and audit pack
- teacher productivity pack
- tenant admin multi-school performance pack
- super admin platform usage pack

## 7.21 Notification Engine

The notification engine is a platform-level infrastructure service. All modules rely on it for event-driven communication. End users interact with it through portal notification centers and delivery channels; platform admins configure it through tenant settings.

### Core responsibilities:

- receive domain events from all platform modules via event bus
- evaluate notification rules, recipient targeting, and routing
- apply user preferences, DND windows, and consent checks before any send
- select delivery channel(s) based on event priority and recipient preference
- render templates with contextual event and entity variables
- dispatch to delivery providers with retry and fallback logic
- track delivery status, opens, clicks, bounces, and acknowledgments
- log all outcomes immutably for audit and analytics

### Delivery channels and provider mapping:

| Channel | SaaS | MicroSaaS | On-Prem |
|---|---|---|---|
| Email | AWS SES / SendGrid / Mailgun (tenant sender domain) | Tenant-supplied credentials | Customer SMTP relay (Exchange, Postfix, Google Workspace) |
| SMS | Twilio / MSG91 (tenant sender ID) | Twilio / MSG91 | Kannel SMPP / local telecom aggregator HTTP |
| Push | Firebase FCM (tenant project) | Firebase FCM | FCM (internet required) or optional self-hosted proxy |
| WhatsApp | Meta Business API (tenant WABA) | Meta Business API | Meta Business API (internet required) |
| In-App | WebSocket / SSE (real-time) | WebSocket / SSE | WebSocket / SSE (self-hosted) |

### Notification categories and priority:

| Category | Examples | Default Priority | DND Bypassable |
|---|---|---|---|
| Emergency | safety incident, evacuation, medical emergency | Critical | No |
| Security | unusual login, unauthorized access, audit anomaly | Critical | No |
| Financial | fee overdue, payment confirmation, late fee applied | High | Yes |
| Academic | marks published, report card ready, exam schedule | High | Yes |
| Attendance | student absent, late arrival, chronic absence alert | High | Yes |
| Transport | bus delay, route change, student boarded / alighted | Medium | Yes |
| Health | medication due, allergy alert, infirmary visit | High | Yes |
| Events | school event, PTM reminder, permission slip due | Medium | Yes |
| General | announcement, circular, school news | Low | Yes |
| Digest | batched low-priority updates | Low | Yes |

### Template engine:

- templates stored in database and editable by Tenant Admin through admin portal
- per-channel, per-event-type, per-locale template set
- variable substitution from event payload, student profile, family profile, and school context
- email templates use MJML for responsive cross-client rendering
- SMS templates include DLT template ID field (mandatory for India deployments)
- platform ships default templates for all event types; tenants can override per locale
- template preview and test-send available in admin UI before activation
- versioned templates with rollback capability

### Digest and batching:

- users configure digest frequency per category: immediate / hourly / daily / weekly
- Critical and High priority notifications always bypass digest and send immediately
- digest email template consolidates all pending items into a single readable message grouped by category
- user can pause digest and switch back to immediate at any time from preference center

### Fallback chain:

- primary channel defined per notification type and tenant configuration
- if delivery fails or message is unread after a configurable time window, escalate to next channel in chain
- example default chain for fee reminder: email → (unread 2h) → SMS → (undelivered 30m) → in-app
- emergency type: simultaneous blast across all active channels with no wait window between channels
- fallback chain is audited: each step logged with reason for escalation

### Delivery tracking:

- per notification record: sent_at, delivered_at, opened_at, clicked_at, acknowledged_at, bounced_reason
- provider webhook receivers capture bounce, complaint, and unsubscribe events in real time
- delivery rate, open rate, click rate, bounce rate, and unsubscribe rate visible in notification analytics dashboard
- per-recipient delivery history accessible to authorized admin users for support and audit

### Emergency broadcast:

- simultaneous dispatch across all active channels (email, SMS, push, WhatsApp, in-app)
- bypasses DND, digest, throttle, and opt-out settings
- real-time delivery confirmation dashboard showing delivered vs. unacknowledged per recipient
- two-way SMS acknowledgment (reply Y to confirm receipt)
- automatic escalation to alternate emergency contact if primary unacknowledged after 15 minutes
- authorized senders: Principal, School Admin, Tenant Admin, Super Admin only
- mandatory immutable audit log entry for every emergency broadcast including sender identity, timestamp, recipient count, and delivery outcome

### Rate limiting and anti-spam:

- per-recipient per-type maximum frequency rules (e.g., fee reminder maximum once per 24 hours)
- burst protection with queue smoothing to prevent sudden load spikes
- throttle events logged with reason and visible in admin notification health dashboard
- tenant-level daily volume caps configurable by deployment tier

### On-Prem deployment specifics:

- customer configures SMTP relay credentials (TLS/STARTTLS, Basic auth, OAuth2, or certificate)
- customer configures SMS gateway endpoint (Kannel SMPP parameters or aggregator REST config)
- queue runs on self-hosted Redis (BullMQ) or RabbitMQ
- event bus runs on Apache Kafka or RabbitMQ
- zero external notification API dependency; all delivery stays within customer network perimeter
- AI features use Anthropic API if internet-connected; degrade gracefully to rule-based logic if air-gapped

### Webhook API:

- outbound webhooks push delivery lifecycle events to external systems (CRM, analytics, third-party integrations)
- events published: notification.sent, notification.delivered, notification.opened, notification.bounced, notification.unsubscribed, notification.acknowledged
- HMAC-SHA256 signed payloads for receiver verification
- configurable per tenant: endpoint URL, subscribed events, signing secret
- delivery retry on webhook failure with exponential backoff

### Notification analytics dashboard:

- per-tenant: delivery rate, open rate, click rate, bounce rate, unsubscribe rate, and acknowledgment rate
- per-category and per-channel breakdown
- time-series engagement trend charts
- failed delivery drill-down by error reason and provider
- top unread recipients and at-risk engagement list
- throttle event log
- provider health status and queue depth indicators

AI opportunities:

- smart prioritization engine scoring each incoming notification event by urgency, impact, and recipient context
- optimal send-time prediction per recipient based on historical engagement patterns
- notification fatigue detection with automatic digest-mode suggestion when fatigue score crosses threshold
- content personalization using student profile and family context to make templates contextually relevant
- AI-generated weekly child progress summaries for parents aggregating attendance, marks, homework, and teacher notes
- response drafting suggestions for staff replying to parent and student messages
- sentiment analysis on incoming parent messages with automatic urgent-flag escalation to counselor or principal
- auto-translation to recipient's preferred language with variable preservation
- pre-send AI content validation to detect PII leakage, hallucinated values, or off-tone language before dispatch

## 8. AI-First Capabilities

AI should be embedded across workflows, not isolated in a chatbot.

### 8.1 AI Co-Pilots by Role

- Parent co-pilot: fee explanation, child progress summary, school policy Q&A
- Teacher co-pilot: lesson draft, assessment draft, class summary, intervention suggestions
- Admin co-pilot: admissions follow-up, document review, workflow summarization
- Principal co-pilot: risk dashboards, trend summaries, action recommendations
- Compliance co-pilot: checklist completion, missing-data detection, reporting assistance

### 8.2 AI Use Cases

- natural language search across school data with permissions
- document summarization
- multilingual translation
- meeting notes and action items
- predictive alerts
- personalized nudges
- automated drafting of notices, emails, and reports
- anomaly detection
- operational forecasting
- smart notification prioritization scoring each event by urgency, impact, and recipient context
- notification fatigue detection and automatic digest-mode recommendation
- optimal notification send-time prediction per recipient
- AI-generated weekly parent progress summaries (attendance, grades, homework, teacher notes)
- notification content personalization with student and family context
- pre-send notification content validation (PII, accuracy, tone)
- parent message sentiment analysis with urgent escalation flag
- response draft suggestions for staff replying to parent messages
- auto-translation for multilingual notification delivery

### 8.3 AI Guardrails

- human approval for high-impact actions
- explainable recommendations
- role-based data masking
- prompt and response logging for sensitive workflows
- age-appropriate and policy-safe responses
- configurable AI access by role and school policy
- AI-generated notifications never sent without human review gate (configurable per template)
- pre-send content validation for all AI-generated notification content: PII leakage check, factual accuracy check, tone check
- AI suggestions shown as drafts; final send action always requires human confirmation
- false-positive rate monitoring for AI risk alerts with feedback loop for correction
- AI feature availability configurable per deployment mode (disabled or degraded for air-gapped On-Prem if no local LLM configured)

## 9. Major Gaps in Current School Management Solutions

This section summarizes the common market gaps that this product should intentionally solve.

### 9.1 Fragmented Experience

Current pattern:

- admissions, SIS, LMS, payments, transport, and communication are often separate products or weakly connected modules.

Impact:

- duplicate data entry
- inconsistent records
- low adoption
- poor parent experience

### 9.2 Weak Interoperability

Current pattern:

- many systems still rely on custom imports, exports, or brittle integrations.

Impact:

- slow onboarding of new tools
- sync failures
- inconsistent grades, rosters, and attendance across systems

### 9.3 Too Much Admin Work for Teachers

Current pattern:

- attendance, grades, feedback, and parent communication live in different interfaces.

Impact:

- teacher frustration
- low-quality or delayed updates
- more time on data entry than intervention

### 9.4 Parent Portals Inform but Rarely Guide

Current pattern:

- most systems show grades, attendance, and announcements, but do not tell parents what matters most right now.

Impact:

- parent anxiety
- over-notification
- low-value engagement

### 9.5 Analytics Are Mostly Descriptive

Current pattern:

- dashboards show what happened, but not why it happened or what to do next.

Impact:

- management still relies on manual interpretation
- interventions are late

### 9.6 Compliance Is Bolted On

Current pattern:

- privacy, consent, government reporting, and audit needs are often handled through external spreadsheets or manual processes.

Impact:

- reporting errors
- audit risk
- inconsistent data governance

### 9.7 AI Is Often Shallow

Current pattern:

- many vendors now market AI, but it is often limited to generic content generation or surface-level assistants.

Impact:

- limited ROI
- low trust
- AI not connected to real school operations

### 9.8 Poor Exception Handling

Current pattern:

- systems work for standard flows, but struggle with sibling billing differences, separated guardians, special accommodations, transfer cases, and compliance exceptions.

Impact:

- schools fall back to manual work

### 9.9 Accessibility and Inclusion Are Underbuilt

Current pattern:

- accessibility, multilingual access, and inclusive design are inconsistent.

Impact:

- weaker adoption by diverse families and staff
- equity risk

## 10. Recommended Differentiators

The product should differentiate on the following:

1. Unified student and family graph
2. AI-driven action center instead of passive dashboards
3. Strong parent experience with multilingual, prioritized, actionable communication
4. Teacher-first workflow simplification
5. Compliance and audit readiness by design
6. Open integration architecture
7. Predictive risk and intervention engine
8. Configurable support for different boards, fee structures, school types, and regulatory environments
9. Accessibility-first mobile and web design
10. Cross-functional workflow automation

## 11. Non-Functional Requirements

## 11.1 Security

- role-based and attribute-based access control
- configurable RBAC with scope-based permissions
- encryption at rest and in transit
- audit logs for critical actions
- consent-aware data access
- secure document handling
- incident response processes

## 11.2 Privacy

- parental rights and student privacy controls where legally applicable
- DPDP-aligned consent, notice, and grievance workflow support for Indian deployments
- consent management
- data minimization
- retention and deletion policies
- third-party processor governance
- AI data handling controls
- access/correction/erasure request intake workflows

## 11.3 Accessibility

- WCAG 2.2-aligned web and mobile experience
- keyboard navigation
- screen reader support
- accessible authentication and forms
- multilingual readability support

## 11.4 Performance and Reliability

- mobile-friendly low-bandwidth support
- high availability for parent and attendance workflows
- peak-load handling for result day, fee deadlines, and admissions season

## 11.5 Scalability

- support for small schools, school groups, and districts
- modular deployment
- tenant-level configuration

## 11.6 Interoperability

- API-first architecture
- support for SIS/LMS/finance integrations
- standard-based integration where possible
- event-driven sync for near-real-time updates

## 12. Data Model Priorities

Core entities:

- student
- family/guardian
- staff
- class/section
- subject/course
- academic term
- attendance event
- assessment and grade
- fee item and payment
- communication event
- transport route and trip
- health/safety incident
- intervention case
- compliance artifact
- consent record
- privacy request
- retention policy
- data-sharing record

Notification engine entities:

- notification_template — channel, locale, event_type, subject, body, variables, version, tenant_id
- notification_event — source_module, event_type, entity_id, triggered_by, payload, created_at
- notification_job — template_id, recipient_id, channel, priority, scheduled_at, status, retry_count, digest_group
- notification_log — job_id, provider, status, sent_at, delivered_at, opened_at, clicked_at, bounced_at, bounced_reason, acknowledged_at (immutable append-only)
- notification_preference — user_id, event_category, channels_enabled, digest_frequency, dnd_start, dnd_end, timezone
- notification_consent — user_id, channel, consented_at, ip, notice_version, revoked_at (DPDP and GDPR aligned)
- tenant_notification_config — provider bindings, api_keys (encrypted), sender_id, from_address, rate_limit_rules, fallback_chain
- emergency_broadcast — broadcast_id, initiated_by, scope, channels, sent_at, delivered_count, acknowledged_count, unacknowledged_recipients

Key design rule:

Every module should attach to shared master entities so the platform can produce a true 360-degree school view. All notification events must be traceable back to their source module, source entity, and the user who triggered them.

## 13. Recommended Workflow Automations

- new inquiry to admission to enrollment
- leave request to approval to attendance update
- absent student to parent alert to counselor escalation
- low-performance detection to teacher review to intervention plan
- overdue fee to reminder to finance follow-up
- incident logged to parent notification to case review
- transfer request to records package to receiving-school handoff
- government report draft to validation to final submission

### Notification-specific workflow automations:

- fee overdue day 0: email to parent → day 3: SMS → day 7: WhatsApp + escalation to finance officer with full contact history
- student absent: SMS to parent within 5 minutes → if no acknowledgment after 30 minutes: call to alternate contact flag raised for counselor
- exam results published: in-app notification to student and parent → if not opened in 24h: push notification
- transport delay detected: push + SMS to all parents on affected route → clear notification when delay resolved
- allergy or medical alert: in-app to class teacher and nurse immediately → email to parent with action taken
- chronic absenteeism threshold crossed: in-app alert to counselor and principal → email to parent with meeting request draft
- emergency broadcast initiated: simultaneous all-channel blast → real-time acknowledgment tracking → escalation after 15 minutes for unacknowledged
- consent withdrawal received: immediate channel disable + consent record update + confirmation email to user

## 14. MVP Recommendation

Phase 1 MVP should include:

- platform admin
- admissions
- SIS
- attendance
- timetable
- assignments and gradebook
- parent app and communication
- fee management
- basic analytics
- AI summaries, alerts, and drafting
- notification engine (email + SMS + in-app, core event triggers, basic preferences)

Reason:

This creates the minimum unified operating core for most schools while already showing AI value. The notification engine is foundational — without it, parent engagement, attendance alerts, and fee reminders cannot function. MVP notification scope covers: email and SMS delivery, in-app notification center, the five highest-priority event triggers (student absent, fee overdue, emergency broadcast, assignment acknowledgment, announcements), basic opt-out preferences, and template management.

## 15. Phase 2 Expansion

- HR and payroll
- accounting
- transport
- library
- health and safety
- compliance reporting
- intervention engine
- advanced analytics
- notification engine: push notifications, WhatsApp channel, digest engine, DND windows, fallback chains, delivery analytics dashboard, multi-tenant provider isolation
- notification engine: AI smart prioritization, optimal send-time prediction, fatigue detection, content personalization, auto-translation

## 16. Phase 3 Strategic Expansion

- district / trust benchmarking
- advanced AI forecasting
- recommendation engine for retention and outcomes
- alumni and fundraising
- hostel/residential workflows
- ecosystem marketplace and partner integrations
- notification engine: A/B testing for notification content, cross-channel journey orchestration, engagement scoring, predictive delivery analytics, archive and retention management, benchmark reporting across school groups

## 17. Risks to Watch

- trying to build too many modules too early
- adding AI before clean workflow/data design
- country-specific hardcoding
- weak permissions around sensitive student data
- poor mobile UX for parents
- low teacher adoption due to click-heavy workflows
- analytics without trusted data quality

## 18. Product Success Metrics

Operational:

- reduction in manual data entry time
- reduction in attendance closure time
- reduction in admissions processing time
- reduction in compliance preparation effort

Academic:

- teacher update timeliness
- assignment completion rates
- intervention response time
- absenteeism reduction

Financial:

- fee collection rate
- overdue fee reduction
- forecast accuracy

Engagement:

- parent app active usage
- message read rate
- meeting participation rate
- satisfaction scores by role

AI:

- AI suggestion acceptance rate
- admin time saved
- teacher drafting time saved
- false-positive rate in risk alerts

## 19. Final Recommendation

The best opportunity is not to create a generic school ERP. The winning product is an AI-first school operations and student success platform that:

- unifies fragmented modules
- reduces staff workload
- gives parents clearer, calmer, more useful engagement
- helps teachers act earlier on student needs
- gives management decision-ready intelligence
- makes compliance easier and safer

If built well, this product can sit at the center of a school's operational and academic ecosystem.

## 20. Market and Standards Notes

The analysis above is based on a combination of:

- common modules promoted by current school software vendors
- current interoperability standards used in education technology
- current privacy and accessibility expectations for education systems

Examples reviewed:

- Infinite Campus parent/student access patterns
- Skyward teacher tools such as attendance, gradebook, behavior, and messaging
- Blackbaud's unified private-school management positioning across enrollment, SIS, LMS, tuition, and accounting
- Ed-Fi standards for K-12 data interoperability
- 1EdTech OneRoster and LTI standards for roster, grade, and learning tool integration
- U.S. Department of Education FERPA/PPRA guidance as a useful benchmark for student privacy design
- W3C WCAG 2.2 as a useful accessibility benchmark
- India DPDP Act and DPDP Rules as a useful benchmark for privacy capability in Indian deployments

## 21. Source Links

- Infinite Campus Parents & Students: https://www.infinitecampus.com/parents-and-students
- Blackbaud K-12 overview: https://www.blackbaud.com/who-we-serve/k-12-schools
- Blackbaud K-12 total school solution: https://www.blackbaud.com/newsroom/article/k-12-schools-select-blackbaud-software-to-create-a-unified-total-school-experience
- Skyward classroom tools: https://www.skyward.com/products/student-information-system/classroom-tools
- Skyward gradebook: https://skyward.com/products/student-information-system/classroom-tools/gradebook
- Ed-Fi Data Standards: https://docs.ed-fi.org/reference/data-exchange/data-standard
- Ed-Fi overview: https://docs.ed-fi.org/getting-started/provider-playbook/project-planning/overview-of-ed-fi-standards-and-technology
- 1EdTech OneRoster: https://www.1edtech.org/standards/oneroster
- 1EdTech LTI: https://www.1edtech.org/standards/lti
- U.S. Department of Education FERPA overview: https://studentprivacy.ed.gov/faq/what-ferpa
- U.S. Department of Education PPRA overview: https://studentprivacy.ed.gov/faq/what-protection-pupil-rights-amendment-ppra
- W3C WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- MeitY explanatory note to DPDP Rules 2025: https://www.meity.gov.in/writereaddata/files/Explanatory-Note-DPDP-Rules-2025.pdf
- MeitY notification of DPDP Rules 2025 dated November 13, 2025: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

## 22. Deployment Models

The platform must support three deployment modes. All functional modules must operate across all three modes; only infrastructure bindings change.

### 22.1 SaaS

Target: school groups and districts that want zero infrastructure management.

- hosted on cloud (AWS or equivalent)
- multi-tenant architecture with strict data isolation per tenant (schema-per-tenant or row-level security)
- platform manages all infrastructure, upgrades, backups, and provider accounts
- email: AWS SES or SendGrid with per-tenant sender domain (SPF and DKIM configured per tenant)
- SMS: Twilio sub-accounts or MSG91 with per-tenant sender ID
- push: Firebase FCM with per-tenant project or shared project with tenant-scoped tokens
- queue: managed Redis cluster with per-tenant namespace
- event bus: AWS EventBridge or managed Kafka
- AI: Anthropic API with per-tenant key or shared with tenant-level rate limiting
- monitoring: cloud-native (CloudWatch, Datadog, or equivalent)
- tenant onboarding: self-service or sales-assisted; provider accounts provisioned automatically

### 22.2 MicroSaaS

Target: single schools or small school groups that want a managed solution but with more control over costs and data.

- single-tenant or small fixed multi-tenant deployment
- same application stack as SaaS; fewer replicas and simplified topology
- provider credentials supplied by tenant or provisioned on request
- cost-optimized routing: fewer fallback chains by default; digest-first to reduce SMS volume
- email: Mailgun or customer-supplied SMTP credentials
- SMS: Twilio or MSG91 with tenant-managed account
- queue: single-node Redis with BullMQ
- event bus: Redis Streams
- AI: Anthropic API with tenant-supplied key
- monitoring: lightweight (Prometheus + Grafana or equivalent)
- deployment: Docker Compose or small Kubernetes cluster

### 22.3 On-Prem

Target: schools and districts with strict data sovereignty requirements, air-gapped environments, or existing enterprise infrastructure contracts.

- deployed within customer's own data center or private cloud
- customer owns and manages all infrastructure
- email: customer-supplied SMTP relay (Microsoft Exchange, Postfix, Google Workspace SMTP relay); supports TLS, STARTTLS, OAuth2, Basic Auth, and certificate authentication
- SMS: customer-supplied SMS gateway; Kannel SMPP integration or local telecom aggregator HTTP API; customer manages telecom contract and DLT registration
- push: Firebase FCM if internet-connected; self-hosted FCM proxy or APNs direct optionally supported
- WhatsApp: Meta Business API if internet-connected; can be disabled for fully air-gapped deployments
- queue: self-hosted Redis (BullMQ) or RabbitMQ
- event bus: Apache Kafka or RabbitMQ
- AI: Anthropic API if internet-connected; local LLM (Ollama with Llama 3 or equivalent) if air-gapped with graceful feature degradation and visible indicator to users
- monitoring: Prometheus + Grafana (self-hosted); no external telemetry without explicit consent
- deployment: Helm chart for Kubernetes or Docker Compose for single-node; air-gap container registry supported
- upgrades: customer-managed with platform-provided release packages; no auto-update without approval
- all data stays within customer network perimeter; zero call-home telemetry by default

### 22.4 Feature Parity Commitment

All three deployment modes must support the same user-facing feature set. The following capabilities must work without external dependencies in On-Prem mode:

- in-app notification center
- email delivery (via customer SMTP)
- SMS delivery (via customer gateway)
- template management
- preference center and consent management
- delivery audit trail
- emergency broadcast (with acknowledgment tracking)
- notification analytics dashboard
- digest and DND engine

The following capabilities require internet connectivity and degrade gracefully when unavailable:

- push notifications (FCM/APNs)
- WhatsApp delivery
- AI-powered features (prioritization, translation, summaries, personalization)
- provider delivery tracking webhooks (open/click rates for cloud providers)

## 23. Notification Engine Implementation Roadmap

This section defines the phased delivery plan for the notification engine. Phases align with the platform MVP and expansion roadmap in Sections 14–16.

### Phase 0: Foundation Architecture (Weeks 1–3)

Goal: Build the abstractions everything else plugs into. No user-facing features yet.

Deliverables:
- provider abstraction layer: NotificationChannel interface with implementations for email, SMS, push, WhatsApp, in-app
- core data models: notification_template, notification_event, notification_job, notification_log, notification_preference, notification_consent, tenant_notification_config
- queue topology: immediate, digest, and dead-letter queues per channel
- event bus subscription contract: all modules emit domain events to bus; notification engine subscribes
- deployment mode configuration schema: provider bindings, feature flags, fallback chain defaults per mode
- health check endpoint: provider status and queue depth

### Phase 1: MVP Notification Engine (Weeks 4–10)

Goal: Email and SMS working end-to-end. In-app notification center. Five highest-priority event triggers.

Deliverables:
- email delivery pipeline: provider dispatch, MJML templates, tenant sender domain, bounce and complaint webhook receiver, retry with exponential backoff
- SMS delivery pipeline: provider dispatch, character limit handling, delivery receipt tracking, DLT template ID support for India
- in-app notification center: real-time WebSocket, unread count, mark read, click-through to source entity, 30-day retention
- template engine: DB-stored templates, variable substitution, per-locale support, admin preview and test-send
- five event triggers: student absent, fee overdue (day 0 / 3 / 7), emergency broadcast, assignment acknowledgment, school announcement
- basic preference management: per-user opt-out per channel per category; mandatory category protection
- unsubscribe link injection and compliance footer for all email

### Phase 2: Full Channels and Delivery Intelligence (Weeks 11–18)

Goal: Complete channel coverage, anti-spam protection, analytics dashboard, multi-tenant isolation.

Deliverables:
- push notification pipeline: FCM integration, device token management, token refresh, deep-link payloads
- WhatsApp pipeline: Meta Business API, HSM template pre-approval workflow in admin, opt-in flow, delivery and read receipts
- digest engine: per-user frequency configuration, category grouping, smart flush for urgent items, digest email template
- DND engine: user-configured quiet hours, queue-hold during DND, emergency bypass, time-zone awareness, school-wide DND defaults
- fallback chain engine: configurable per notification type, automatic escalation on failure or non-read, full fallback audit
- rate limiting and throttling: per-recipient per-type frequency rules, burst protection, throttle event log
- delivery analytics dashboard: delivery rate, open rate, click rate, bounce rate, unsubscribe rate, time-series charts, failed delivery drill-down
- multi-tenant provider isolation: per-tenant sender domain (SPF/DKIM), per-tenant sender ID, reputation isolation between tenants

### Phase 3: AI-Powered Notification Intelligence (Weeks 19–26)

Goal: Make the notification system proactively smart using Claude API.

Deliverables:
- smart prioritization engine: Claude API scores each notification event on urgency, impact, and recipient context; routes to immediate or digest based on score with explanation text visible to admins
- optimal send-time prediction: per-user historical engagement analysis; schedule non-urgent notifications at predicted high-engagement window
- notification fatigue detection: rolling engagement score per user; auto-switch to digest and alert admin when fatigue threshold crossed
- content personalization: Claude API enriches standard templates with student-specific and family-specific context before send
- auto-translation: Claude API translates notification content to recipient's preferred language with variable preservation; translation cache per template and locale
- weekly progress summaries: Friday 6pm AI-generated digest for parents aggregating attendance, grades, homework, and teacher notes; optional teacher review gate before send
- response draft suggestions: Claude API generates 2–3 draft reply options when staff open a parent message; staff selects, edits, and sends; never auto-sent
- sentiment analysis: incoming parent messages classified by sentiment and urgency; urgent flag routes to counselor or principal in-app immediately
- AI content validation gate: pre-send check for PII leakage, hallucinated values, and off-tone language; blocked content routed to admin review queue

### Phase 4: Enterprise, Compliance, and On-Prem Hardening (Weeks 27–34)

Goal: Compliance-ready, audit-safe, full On-Prem deployment parity.

Deliverables:
- consent and preference center: explicit opt-in per channel per category at onboarding; DPDP and GDPR aligned consent records; withdrawal workflow with immediate channel disable; exportable consent audit report
- immutable notification audit trail: append-only log with full delivery lifecycle, fallback chain steps, AI decisions, and sender identity; search and filter for admin; CSV/PDF export; configurable retention per tenant
- emergency broadcast system: all-channel simultaneous dispatch; real-time delivery confirmation dashboard; SMS acknowledgment (reply Y); alternate contact escalation after 15 minutes; Principal and Admin authorization only; mandatory audit log per broadcast
- On-Prem full parity: customer SMTP relay (TLS/STARTTLS/OAuth2/Basic), Kannel SMPP and HTTP aggregator, self-hosted Redis or RabbitMQ queue, Apache Kafka or RabbitMQ event bus, optional local LLM for air-gapped AI, Helm chart and Docker Compose deployment packages
- outbound webhook API: delivery event push to external systems, HMAC-SHA256 signed, configurable per tenant, retry on failure
- SLA monitoring: per-priority delivery SLA targets (Critical < 30s, High < 2m, Medium < 10m); breach alerting to Super Admin; queue depth alerting; provider health failover

### Phase 5: Scale, Optimization, and Advanced Intelligence (Weeks 35–42)

Goal: Data-driven optimization and cross-channel journey orchestration.

Deliverables:
- A/B testing: variant content experiments per template; split recipient groups; track open rate, click rate, and action completion; auto-promote winning variant; experiment builder in admin UI
- cross-channel journey orchestration: visual journey builder with trigger, wait, condition, and action steps; pre-built journeys for fee collection, absenteeism escalation, and admissions follow-up; tenant customization
- engagement scoring: per-user composite engagement score from email opens, SMS reads, app opens, and action completions; low-engagement flagging and channel recommendation; content richness gating
- predictive delivery analytics: Claude API predicts expected open rate and action rate for planned notification campaigns before send
- archive and retention management: automated archival past retention policy, legal hold for specific users, parent data-portability export, erasure request deletion workflow with audit confirmation
- benchmark reporting: across-school anonymized delivery benchmarks (SaaS); AI insight on what high-engagement schools do differently

### Recommended Technology Stack

| Layer | SaaS / MicroSaaS | On-Prem |
|---|---|---|
| Backend | NestJS (TypeScript) event-driven microservice | Same |
| Queue | BullMQ on Redis | BullMQ on self-hosted Redis or RabbitMQ |
| Email | AWS SES (primary) + SendGrid (fallback) | Customer SMTP relay |
| SMS | Twilio (global) + MSG91 (India) | Kannel SMPP or local HTTP aggregator |
| Push | Firebase FCM | FCM (internet required) or optional self-hosted proxy |
| WhatsApp | Meta Business API (tenant WABA) | Meta Business API (internet required) |
| AI | Anthropic Claude API (claude-sonnet-4-6 or latest) | Anthropic API or Ollama with local LLM (air-gap) |
| Template engine | MJML (email) + plain text interpolation (SMS) | Same |
| Database | PostgreSQL (notification records) + Redis (in-app real-time) | Same (self-hosted) |
| Event bus | AWS EventBridge or Redis Streams | Apache Kafka or RabbitMQ |
| Monitoring | DataDog or CloudWatch | Prometheus + Grafana |
