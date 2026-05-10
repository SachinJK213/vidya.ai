import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InfoTip } from '@/components/ui/InfoTip'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import {
  Loader2, ArrowLeft, Building2, Users, GraduationCap, Globe,
  KeyRound, Copy, Check, Calendar, ShieldCheck, AlertTriangle,
  ShieldX, Clock, Bell, BellRing, Pencil, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string; name: string; code: string; domain: string | null
  deploymentMode: string; isActive: boolean; createdAt: string; updatedAt: string
  _count: { users: number; students: number }
}

interface License {
  id: string; plan: string; status: string; daysUntilExpiry: number
  maxStudents: number; maxUsers: number; isSuspended: boolean
  features: { aiEnabled: boolean; smsEnabled: boolean; whatsappEnabled: boolean }
  startsAt: string; expiresAt: string; notes: string | null
  tenant: { name: string; code: string; _count: { users: number; students: number } }
  reminders: { id: string; triggerDays: number; sentById: string | null; sentAt: string }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_DEFAULTS: Record<string, { maxStudents: number; maxUsers: number; durationDays: number }> = {
  TRIAL:        { maxStudents: 50,     maxUsers: 10,   durationDays: 30  },
  STARTER:      { maxStudents: 300,    maxUsers: 40,   durationDays: 365 },
  PROFESSIONAL: { maxStudents: 1500,   maxUsers: 150,  durationDays: 365 },
  ENTERPRISE:   { maxStudents: 999999, maxUsers: 9999, durationDays: 365 },
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; icon: React.ReactNode; border: string }> = {
  ACTIVE:        { label: 'Active',         variant: 'success',     icon: <ShieldCheck className="h-4 w-4" />,    border: 'border-emerald-200' },
  EXPIRING_SOON: { label: 'Expiring Soon',  variant: 'warning',     icon: <AlertTriangle className="h-4 w-4" />, border: 'border-amber-200'   },
  GRACE_PERIOD:  { label: 'Grace Period',   variant: 'warning',     icon: <Clock className="h-4 w-4" />,         border: 'border-amber-200'   },
  EXPIRED:       { label: 'Expired',        variant: 'destructive', icon: <ShieldX className="h-4 w-4" />,       border: 'border-red-200'     },
  SUSPENDED:     { label: 'Suspended',      variant: 'secondary',   icon: <ShieldX className="h-4 w-4" />,       border: 'border-gray-200'    },
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-sky-100 text-sky-700',
  PROFESSIONAL: 'bg-violet-100 text-violet-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
}

const DEPLOY_LABEL: Record<string, string> = { SAAS: 'SaaS', MICROSAAS: 'MicroSaaS', ONPREM: 'On-Prem' }

// ─── Small helpers ────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
      {copied ? <><Check className="h-3 w-3 text-emerald-500" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
    </button>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  )
}

function ExpiryLabel({ days }: { days: number }) {
  if (days > 0) return <span className={cn('text-sm font-medium', days <= 30 ? 'text-amber-600' : 'text-emerald-600')}>in {days} day{days !== 1 ? 's' : ''}</span>
  if (days === 0) return <span className="text-sm font-semibold text-amber-600">today</span>
  return <span className="text-sm font-semibold text-destructive">{Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''} ago</span>
}

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max >= 999999 ? 0 : Math.min(100, Math.round((used / max) * 100))
  const over = pct >= 90
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium', over ? 'text-amber-600' : 'text-foreground')}>
          {used} / {max >= 999999 ? '∞' : max}
        </span>
      </div>
      {max < 999999 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full transition-all', over ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── Assign / Edit License Form ───────────────────────────────────────────────

function LicenseForm({ tenantId, existing, onDone }: { tenantId: string; existing?: License; onDone: () => void }) {
  const isEdit = !!existing

  function defaultExpiresAt(plan: string, existing?: License) {
    if (existing) return existing.expiresAt.slice(0, 10)
    const days = PLAN_DEFAULTS[plan]?.durationDays ?? 365
    const d = new Date(); d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const [plan, setPlan] = useState(existing?.plan ?? 'STARTER')
  const [expiresAt, setExpiresAt] = useState(() => defaultExpiresAt(existing?.plan ?? 'STARTER', existing))
  const [maxStudents, setMaxStudents] = useState(existing?.maxStudents?.toString() ?? '')
  const [maxUsers, setMaxUsers] = useState(existing?.maxUsers?.toString() ?? '')
  const [aiEnabled, setAiEnabled] = useState(existing?.features?.aiEnabled ?? true)
  const [smsEnabled, setSmsEnabled] = useState(existing?.features?.smsEnabled ?? false)
  const [whatsappEnabled, setWhatsappEnabled] = useState(existing?.features?.whatsappEnabled ?? false)
  const [notes, setNotes] = useState(existing?.notes ?? '')

  function handlePlanChange(p: string) {
    setPlan(p)
    setExpiresAt(defaultExpiresAt(p))
    const def = PLAN_DEFAULTS[p]
    setMaxStudents(def?.maxStudents >= 999999 ? '' : def?.maxStudents?.toString() ?? '')
    setMaxUsers(def?.maxUsers >= 9999 ? '' : def?.maxUsers?.toString() ?? '')
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () => isEdit
      ? api.patch(`/licenses/${existing!.id}`, { plan, expiresAt, maxStudents: maxStudents ? +maxStudents : undefined, maxUsers: maxUsers ? +maxUsers : undefined, features: { aiEnabled, smsEnabled, whatsappEnabled }, notes: notes || undefined })
      : api.post('/licenses', { tenantId, plan, expiresAt, maxStudents: maxStudents ? +maxStudents : undefined, maxUsers: maxUsers ? +maxUsers : undefined, features: { aiEnabled, smsEnabled, whatsappEnabled }, notes: notes || undefined }),
    onSuccess: () => { toast({ title: isEdit ? 'License updated' : 'License assigned' }); onDone() },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  })

  const def = PLAN_DEFAULTS[plan]

  return (
    <div className="space-y-5">
      {/* Plan */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.keys(PLAN_DEFAULTS).map((p) => (
          <button key={p} type="button" onClick={() => handlePlanChange(p)}
            className={cn('rounded-xl border-2 px-4 py-3 text-left transition-all', plan === p ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
            <span className={cn('inline-block rounded px-2 py-0.5 text-xs font-semibold', PLAN_COLORS[p])}>{p}</span>
            <p className="mt-2 text-xs text-muted-foreground">{PLAN_DEFAULTS[p].maxStudents >= 999999 ? '∞' : PLAN_DEFAULTS[p].maxStudents} students · {PLAN_DEFAULTS[p].maxUsers >= 9999 ? '∞' : PLAN_DEFAULTS[p].maxUsers} users</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Expiry */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label>Expiry date</Label>
            <InfoTip text="The date this license expires. After expiry + 7-day grace period, the school will be locked out." />
          </div>
          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-10" min={new Date().toISOString().slice(0, 10)} />
        </div>

        {/* Overrides */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label>Max students <span className="text-muted-foreground">(override)</span></Label>
            <InfoTip text={`Default for ${plan}: ${def?.maxStudents >= 999999 ? 'unlimited' : def?.maxStudents}. Leave blank to use plan default.`} />
          </div>
          <Input type="number" placeholder={def?.maxStudents >= 999999 ? 'Unlimited' : String(def?.maxStudents)} value={maxStudents} onChange={(e) => setMaxStudents(e.target.value)} className="h-10" min={1} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label>Max users <span className="text-muted-foreground">(override)</span></Label>
            <InfoTip text={`Default for ${plan}: ${def?.maxUsers >= 9999 ? 'unlimited' : def?.maxUsers}. Counts teachers, parents, and admins.`} />
          </div>
          <Input type="number" placeholder={def?.maxUsers >= 9999 ? 'Unlimited' : String(def?.maxUsers)} value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className="h-10" min={1} />
        </div>

        <div className="space-y-1.5">
          <Label>Internal notes <span className="text-muted-foreground">(optional)</span></Label>
          <Input placeholder="e.g. Annual contract, PO #123" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-10" />
        </div>
      </div>

      {/* Feature toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Features</p>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'ai', label: 'AI summaries & drafts', val: aiEnabled, set: setAiEnabled },
            { key: 'sms', label: 'SMS notifications', val: smsEnabled, set: setSmsEnabled },
            { key: 'wa', label: 'WhatsApp notifications', val: whatsappEnabled, set: setWhatsappEnabled },
          ].map(({ key, label, val, set }) => (
            <button key={key} type="button" onClick={() => set(!val)}
              className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all', val ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
              <div className={cn('h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors', val ? 'border-primary bg-primary' : 'border-muted-foreground')}>
                {val && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => mutate()} disabled={isPending} className="gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update license' : 'Assign license'}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TenantDetail() {
  const { code } = useParams<{ code: string }>()
  const qc = useQueryClient()
  const [editingLicense, setEditingLicense] = useState(false)
  const [assigningLicense, setAssigningLicense] = useState(false)

  const { data: tenant, isLoading: tenantLoading } = useQuery<Tenant>({
    queryKey: ['tenant-by-code', code],
    queryFn: () => api.get(`/tenants/by-code/${code}`),
    enabled: !!code,
  })

  const { data: license, isLoading: licenseLoading } = useQuery<License | null>({
    queryKey: ['tenant-license', tenant?.id],
    queryFn: () => api.get(`/licenses/tenant/${tenant!.id}`),
    enabled: !!tenant?.id,
  })

  const { mutate: sendReminder, isPending: reminding } = useMutation({
    mutationFn: () => api.post(`/licenses/${license!.id}/remind`),
    onSuccess: (res: any) => {
      toast({ title: 'Reminder sent', description: `Sent to ${res.sent} admin(s)` })
      qc.invalidateQueries({ queryKey: ['tenant-license'] })
    },
    onError: (e: Error) => toast({ title: 'Failed to send reminder', description: e.message, variant: 'destructive' }),
  })

  const { mutate: toggleSuspend, isPending: suspending } = useMutation({
    mutationFn: () => api.patch(`/licenses/${license!.id}`, { status: license?.isSuspended ? 'ACTIVE' : 'SUSPENDED' }),
    onSuccess: () => { toast({ title: license?.isSuspended ? 'License re-activated' : 'License suspended' }); qc.invalidateQueries({ queryKey: ['tenant-license'] }) },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  })

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ['tenant-by-code', code] })
    qc.invalidateQueries({ queryKey: ['tenant-license', tenant?.id] })
    setEditingLicense(false)
    setAssigningLicense(false)
  }

  if (tenantLoading) return <AppLayout><div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></AppLayout>

  if (!tenant) return (
    <AppLayout>
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-display text-lg font-semibold">School not found</p>
        <Button variant="outline" asChild><Link to="/superadmin/tenants"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
      </div>
    </AppLayout>
  )

  const statusCfg = license ? (STATUS_CONFIG[license.status] ?? STATUS_CONFIG.ACTIVE) : null

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link to="/superadmin/tenants" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> All schools
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{tenant.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">/{tenant.code}</span>
                <Badge variant="secondary" className="text-xs">{DEPLOY_LABEL[tenant.deploymentMode] ?? tenant.deploymentMode}</Badge>
                <Badge variant={tenant.isActive ? 'success' : 'destructive'} className="text-xs">{tenant.isActive ? 'Active' : 'Locked'}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: <Users className="h-5 w-5 text-primary" />, label: 'Users', val: tenant._count.users },
            { icon: <GraduationCap className="h-5 w-5 text-primary" />, label: 'Students', val: tenant._count.students },
            { icon: <Calendar className="h-5 w-5 text-primary" />, label: 'Onboarded', val: new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
          ].map(({ icon, label, val }) => (
            <Card key={label}><CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">{icon}</div>
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold">{val}</p></div>
            </CardContent></Card>
          ))}
        </div>

        {/* License card */}
        <Card className={cn('border-2', statusCfg?.border ?? 'border-dashed border-border')}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">License</CardTitle>
                  {license && <p className="text-xs text-muted-foreground">Assigned {new Date(license.startsAt).toLocaleDateString()}</p>}
                </div>
              </div>

              {license && !editingLicense && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditingLicense(true)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => sendReminder()} disabled={reminding}>
                    {reminding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                    Send reminder
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleSuspend()} disabled={suspending}
                    className={license.isSuspended ? 'text-emerald-600 hover:text-emerald-700' : 'text-destructive hover:text-destructive'}>
                    {suspending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : license.isSuspended ? 'Re-activate' : 'Suspend'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {licenseLoading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

            {!licenseLoading && !license && !assigningLicense && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <ShieldX className="h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium text-foreground">No license assigned</p>
                <p className="text-sm text-muted-foreground">This school cannot add students or users until a license is assigned.</p>
                <Button onClick={() => setAssigningLicense(true)} className="mt-1 gap-2">
                  <ShieldCheck className="h-4 w-4" /> Assign license
                </Button>
              </div>
            )}

            {(assigningLicense || (editingLicense && license)) && (
              <div className="mt-2">
                <LicenseForm
                  tenantId={tenant.id}
                  existing={editingLicense ? license! : undefined}
                  onDone={refreshAll}
                />
              </div>
            )}

            {license && !editingLicense && (
              <div className="space-y-5">
                {/* Status banner */}
                <div className={cn('flex items-center gap-3 rounded-lg px-4 py-3',
                  license.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                  license.status === 'EXPIRING_SOON' || license.status === 'GRACE_PERIOD' ? 'bg-amber-50 text-amber-700' :
                  license.status === 'EXPIRED' ? 'bg-red-50 text-red-700' : 'bg-muted text-muted-foreground')}>
                  {statusCfg?.icon}
                  <div>
                    <p className="text-sm font-semibold">{statusCfg?.label}</p>
                    <p className="text-xs">
                      {license.status === 'EXPIRED'
                        ? `Expired ${Math.abs(license.daysUntilExpiry)} days ago — ${Math.max(0, 7 + license.daysUntilExpiry)} days of grace period remaining`
                        : license.status === 'GRACE_PERIOD'
                        ? `License expired — ${Math.max(0, 7 + license.daysUntilExpiry)} days before lockout`
                        : `Expires on ${new Date(license.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', PLAN_COLORS[license.plan])}>
                      {license.plan}
                    </span>
                  </div>
                </div>

                {/* Usage bars */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <UsageBar used={tenant._count.students} max={license.maxStudents} label="Students" />
                  <UsageBar used={tenant._count.users} max={license.maxUsers} label="Users" />
                </div>

                {/* Details */}
                <div className="divide-y divide-border rounded-lg border">
                  <DetailRow label="Expiry">
                    <span>{new Date(license.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="ml-2 text-muted-foreground">(<ExpiryLabel days={license.daysUntilExpiry} />)</span>
                  </DetailRow>
                  <DetailRow label="Features">
                    <div className="flex gap-2">
                      {[['AI', license.features?.aiEnabled], ['SMS', license.features?.smsEnabled], ['WhatsApp', license.features?.whatsappEnabled]].map(([k, v]) => (
                        <span key={String(k)} className={cn('flex items-center gap-1 text-xs', v ? 'text-emerald-600' : 'text-muted-foreground line-through')}>
                          {v && <CheckCircle2 className="h-3 w-3" />}{String(k)}
                        </span>
                      ))}
                    </div>
                  </DetailRow>
                  {license.notes && <DetailRow label="Notes"><span className="text-right text-sm">{license.notes}</span></DetailRow>}
                </div>

                {/* Login code pill */}
                <div className="flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Staff log in using school code</p>
                      <p className="font-mono text-sm font-semibold text-primary">{tenant.code}</p>
                    </div>
                  </div>
                  <CopyBtn text={tenant.code} />
                </div>

                {/* Reminder history */}
                {license.reminders.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reminder history</p>
                    <div className="divide-y divide-border rounded-lg border">
                      {license.reminders.map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">
                              {r.triggerDays === -1 ? 'Manual reminder' : r.triggerDays === 0 ? 'Expiry day reminder' : `${r.triggerDays}-day reminder`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{r.sentById ? 'Manual' : 'Automated'}</span>
                            <span>{new Date(r.sentAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* School details */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-display text-base">School details</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow label="School name">{tenant.name}</DetailRow>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">School code</span>
              <div className="flex items-center gap-2">
                <span className="rounded border border-primary/15 bg-primary/5 px-2 py-1 font-mono text-xs font-semibold text-primary">{tenant.code}</span>
                <CopyBtn text={tenant.code} />
              </div>
            </div>
            <DetailRow label="Deployment">{DEPLOY_LABEL[tenant.deploymentMode] ?? tenant.deploymentMode}</DetailRow>
            <DetailRow label="Custom domain">
              {tenant.domain
                ? <span className="flex items-center gap-1 font-mono text-sm text-primary"><Globe className="h-3.5 w-3.5" />{tenant.domain}</span>
                : <span className="text-muted-foreground">Not configured</span>}
            </DetailRow>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
