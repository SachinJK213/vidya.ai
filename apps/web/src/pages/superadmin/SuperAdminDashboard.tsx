import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import {
  Loader2, Building2, GraduationCap, Users, AlertTriangle,
  ShieldCheck, ShieldX, Clock, CheckCircle2, ArrowRight,
  Sparkles, BellRing,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  counts: { total: number; active: number; locked: number; noLicense: number }
  scale: { students: number; users: number }
  licenses: {
    byStatus: Record<string, number>
    byPlan: Record<string, number>
  }
  attentionNeeded: {
    id: string; name: string; code: string; isActive: boolean
    license: { id: string; plan: string; expiresAt: string; isSuspended: boolean; status: string }
  }[]
  noLicenseTenants: { id: string; name: string; code: string }[]
  recentTenants: {
    id: string; name: string; code: string; deploymentMode: string
    isActive: boolean; createdAt: string
    license: { plan: string; expiresAt: string; isSuspended: boolean } | null
  }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; text: string }> = {
  ACTIVE:        { label: 'Active',        dot: 'bg-emerald-500', text: 'text-emerald-700' },
  EXPIRING_SOON: { label: 'Expiring soon', dot: 'bg-amber-400',   text: 'text-amber-700'   },
  GRACE_PERIOD:  { label: 'Grace period',  dot: 'bg-orange-400',  text: 'text-orange-700'  },
  EXPIRED:       { label: 'Expired',       dot: 'bg-red-500',     text: 'text-red-700'     },
  SUSPENDED:     { label: 'Suspended',     dot: 'bg-gray-400',    text: 'text-gray-600'    },
}

const PLAN_CFG: Record<string, { color: string; bar: string }> = {
  TRIAL:        { color: 'bg-gray-100 text-gray-700',       bar: 'bg-gray-400'    },
  STARTER:      { color: 'bg-sky-100 text-sky-700',         bar: 'bg-sky-500'     },
  PROFESSIONAL: { color: 'bg-violet-100 text-violet-700',   bar: 'bg-violet-500'  },
  ENTERPRISE:   { color: 'bg-amber-100 text-amber-700',     bar: 'bg-amber-500'   },
}

const ATTENTION_STATUS_CFG: Record<string, { badge: string; icon: React.ReactNode }> = {
  EXPIRING_SOON: { badge: 'bg-amber-100 text-amber-700 border-amber-200',   icon: <Clock className="h-3.5 w-3.5" /> },
  GRACE_PERIOD:  { badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  EXPIRED:       { badge: 'bg-red-100 text-red-700 border-red-200',          icon: <ShieldX className="h-3.5 w-3.5" /> },
  SUSPENDED:     { badge: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <ShieldX className="h-3.5 w-3.5" /> },
  NONE:          { badge: 'bg-muted text-muted-foreground border-border',     icon: <ShieldCheck className="h-3.5 w-3.5" /> },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function daysUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, highlight,
}: {
  icon: React.ReactNode; label: string; value: number | string
  sub?: string; highlight?: 'amber' | 'red'
}) {
  return (
    <Card className={cn(highlight === 'red' && 'border-red-200 bg-red-50', highlight === 'amber' && 'border-amber-200 bg-amber-50')}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          highlight === 'red' ? 'bg-red-100' : highlight === 'amber' ? 'bg-amber-100' : 'bg-primary/10')}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn('font-display text-2xl font-bold', highlight === 'red' ? 'text-red-700' : highlight === 'amber' ? 'text-amber-700' : 'text-foreground')}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['superadmin-stats'],
    queryFn: () => api.get('/tenants/stats'),
    staleTime: 60_000,
  })

  const attentionCount = (data?.attentionNeeded.length ?? 0) + (data?.noLicenseTenants.length ?? 0)
  const totalLicensed = Object.values(data?.licenses.byPlan ?? {}).reduce((a, b) => a + b, 0)

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Platform Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {data && (
          <>
            {/* KPI strip */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<Building2 className="h-5 w-5 text-primary" />}
                label="Active Schools"
                value={data.counts.active}
                sub={`${data.counts.total} total · ${data.counts.locked} locked`}
              />
              <KpiCard
                icon={<GraduationCap className="h-5 w-5 text-primary" />}
                label="Total Students"
                value={data.scale.students}
                sub="across all schools"
              />
              <KpiCard
                icon={<Users className="h-5 w-5 text-primary" />}
                label="Staff & Parents"
                value={data.scale.users}
                sub="teachers · admins · parents"
              />
              <KpiCard
                icon={<AlertTriangle className={cn('h-5 w-5', attentionCount > 0 ? 'text-amber-600' : 'text-primary')} />}
                label="Needs Attention"
                value={attentionCount}
                sub={attentionCount > 0 ? 'act on these schools' : 'all good'}
                highlight={attentionCount > 0 ? 'amber' : undefined}
              />
            </div>

            {/* License health + Plan distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* License Health */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="font-display text-base">License Health</CardTitle>
                    <span className="text-sm text-muted-foreground">({totalLicensed} licensed)</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                      const count = data.licenses.byStatus[key] ?? 0
                      const total = Object.values(data.licenses.byStatus).reduce((a, b) => a + b, 0)
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <div className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cfg.dot)} />
                          <span className="w-32 text-sm text-muted-foreground">{cfg.label}</span>
                          <div className="flex flex-1 items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className={cn('h-full rounded-full transition-all', cfg.dot)} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={cn('w-6 text-right text-sm font-semibold tabular-nums', count > 0 && key !== 'ACTIVE' ? cfg.text : 'text-foreground')}>
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {data.counts.noLicense > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gray-300" />
                        <span className="w-32 text-sm text-muted-foreground">No license</span>
                        <div className="flex flex-1 items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted" />
                          <span className="w-6 text-right text-sm font-semibold text-muted-foreground tabular-nums">
                            {data.counts.noLicense}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="font-display text-base">Plan Distribution</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {totalLicensed === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No licenses assigned yet</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(PLAN_CFG).map(([plan, cfg]) => {
                        const count = data.licenses.byPlan[plan] ?? 0
                        const pct = totalLicensed > 0 ? Math.round((count / totalLicensed) * 100) : 0
                        return (
                          <div key={plan} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', cfg.color)}>{plan}</span>
                              <span className="text-sm font-medium tabular-nums text-foreground">{count} <span className="text-xs text-muted-foreground">({pct}%)</span></span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div className={cn('h-full rounded-full transition-all', cfg.bar)} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attention Required */}
            {attentionCount > 0 && (
              <Card className="border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="font-display text-base">Attention Required</CardTitle>
                      <p className="text-xs text-muted-foreground">{attentionCount} school{attentionCount !== 1 ? 's' : ''} need action</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {/* License issues */}
                    {data.attentionNeeded.map((t) => {
                      const cfg = ATTENTION_STATUS_CFG[t.license.status] ?? ATTENTION_STATUS_CFG.NONE
                      const days = daysUntil(t.license.expiresAt)
                      return (
                        <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', cfg.badge)}>
                              {cfg.icon}
                              {STATUS_CFG[t.license.status]?.label ?? t.license.status}
                            </div>
                            <div className="min-w-0">
                              <Link to={`/superadmin/tenants/${t.code}`} className="text-sm font-medium hover:underline">{t.name}</Link>
                              <p className="text-xs text-muted-foreground font-mono">/{t.code}</p>
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center gap-3">
                            <span className="hidden text-xs text-muted-foreground sm:block">
                              {days >= 0 ? `${days}d left` : `${Math.abs(days)}d ago`}
                            </span>
                            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
                              <Link to={`/superadmin/tenants/${t.code}`}>
                                <BellRing className="h-3 w-3" /> Remind
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    {/* No license */}
                    {data.noLicenseTenants.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            <ShieldX className="h-3.5 w-3.5" />
                            No license
                          </div>
                          <div className="min-w-0">
                            <Link to={`/superadmin/tenants/${t.code}`} className="text-sm font-medium hover:underline">{t.name}</Link>
                            <p className="text-xs text-muted-foreground font-mono">/{t.code}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4 h-8 text-xs gap-1.5" asChild>
                          <Link to={`/superadmin/tenants/${t.code}`}>
                            <ShieldCheck className="h-3 w-3" /> Assign
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All clear state */}
            {attentionCount === 0 && totalLicensed > 0 && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">Platform is healthy</p>
                    <p className="text-sm text-emerald-700">All licensed schools are active. No action required.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recently Onboarded */}
            {data.recentTenants.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="font-display text-base">Recently Onboarded</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" asChild>
                      <Link to="/superadmin/tenants">View all <ArrowRight className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {data.recentTenants.map((t) => (
                      <Link key={t.id} to={`/superadmin/tenants/${t.code}`}
                        className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-accent/40 group">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{t.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">/{t.code}</p>
                          </div>
                        </div>
                        <div className="ml-4 flex shrink-0 items-center gap-3">
                          {t.license ? (
                            <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold',
                              PLAN_CFG[t.license.plan]?.color ?? 'bg-muted text-muted-foreground')}>
                              {t.license.plan}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No license</span>
                          )}
                          <span className="hidden text-xs text-muted-foreground sm:block">{relativeTime(t.createdAt)}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
