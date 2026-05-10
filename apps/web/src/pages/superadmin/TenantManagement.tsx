import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { InfoTip } from '@/components/ui/InfoTip'
import { SlugField } from '@/components/ui/SlugField'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Loader2, Building2, Globe, ArrowRight, Eye, EyeOff, ShieldOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TenantLicenseSummary {
  id: string
  plan: string
  expiresAt: string
  isSuspended: boolean
}

interface Tenant {
  id: string
  name: string
  code: string
  deploymentMode: string
  isActive: boolean
  createdAt: string
  _count: { users: number; students: number }
  license: TenantLicenseSummary | null
}

type LicenseStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'GRACE_PERIOD' | 'EXPIRED' | 'SUSPENDED' | 'NONE'

function computeLicenseStatus(license: TenantLicenseSummary | null): LicenseStatus {
  if (!license) return 'NONE'
  if (license.isSuspended) return 'SUSPENDED'
  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.floor((new Date(license.expiresAt).getTime() - Date.now()) / msPerDay)
  if (days > 30) return 'ACTIVE'
  if (days > 0) return 'EXPIRING_SOON'
  if (days >= -7) return 'GRACE_PERIOD'
  return 'EXPIRED'
}

const LICENSE_STATUS_STYLES: Record<LicenseStatus, { label: string; className: string }> = {
  ACTIVE:        { label: 'Active',        className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  EXPIRING_SOON: { label: 'Expiring soon', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  GRACE_PERIOD:  { label: 'Grace period',  className: 'bg-amber-100 text-amber-700 border-amber-200' },
  EXPIRED:       { label: 'Expired',       className: 'bg-red-100 text-red-700 border-red-200' },
  SUSPENDED:     { label: 'Suspended',     className: 'bg-gray-100 text-gray-500 border-gray-200' },
  NONE:          { label: 'No license',    className: 'bg-muted text-muted-foreground border-border' },
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL:        'bg-gray-100 text-gray-700',
  STARTER:      'bg-sky-100 text-sky-700',
  PROFESSIONAL: 'bg-violet-100 text-violet-700',
  ENTERPRISE:   'bg-amber-100 text-amber-700',
}

interface TenantsResponse {
  data: Tenant[]
  meta: { total: number; page: number; totalPages: number }
}

const DEPLOY_VARIANT: Record<string, 'default' | 'secondary' | 'warning'> = {
  SAAS: 'default',
  MICROSAAS: 'secondary',
  ONPREM: 'warning',
}

const DEPLOY_LABEL: Record<string, string> = {
  SAAS: 'SaaS',
  MICROSAAS: 'MicroSaaS',
  ONPREM: 'On-Prem',
}

const EMPTY_FORM = {
  name: '',
  code: '',
  domain: '',
  deploymentMode: 'SAAS',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPassword: '',
}

function OnboardForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPassword, setShowPassword] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.post('/tenants/onboard', {
        ...form,
        domain: form.domain || undefined,
      }),
    onSuccess: (res: any) => {
      toast({ title: 'School onboarded', description: `${res.tenant.name} is live.` })
      setForm(EMPTY_FORM)
      onCreated()
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to onboard', description: err.message, variant: 'destructive' })
    },
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-base">Onboard New School</CardTitle>
            <p className="text-xs text-muted-foreground">Creates the tenant and first admin account in one step</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* School details */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">School details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>School name</Label>
                  <InfoTip text="The full legal name of the school, e.g. 'Delhi Public School, Noida'." />
                </div>
                <Input placeholder="Springfield High School" value={form.name} onChange={(e) => set('name', e.target.value)} required className="h-10" />
              </div>
              <div className="sm:col-span-2">
                <SlugField
                  value={form.code}
                  onChange={(v) => set('code', v)}
                  derivedFrom={form.name}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>Domain <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <InfoTip text="If the school has a custom domain like 'attendance.springfield.edu', enter it here for subdomain-based tenant resolution." />
                </div>
                <Input placeholder="attendance.springfield.edu" value={form.domain} onChange={(e) => set('domain', e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>Deployment mode</Label>
                  <InfoTip text="SaaS: hosted on VidyaAI cloud. MicroSaaS: school brings their own API keys. On-Prem: fully self-hosted, no external calls." />
                </div>
                <select
                  value={form.deploymentMode}
                  onChange={(e) => set('deploymentMode', e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="SAAS">SaaS (VidyaAI cloud)</option>
                  <option value="MICROSAAS">MicroSaaS (own API keys)</option>
                  <option value="ONPREM">On-Prem (self-hosted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                First admin account
              </span>
            </div>
          </div>

          {/* Admin account */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>First name</Label>
                <InfoTip text="The school admin's first name. They can update this after logging in." />
              </div>
              <Input placeholder="Priya" value={form.adminFirstName} onChange={(e) => set('adminFirstName', e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Last name</Label>
                <InfoTip text="The school admin's last name." />
              </div>
              <Input placeholder="Kapoor" value={form.adminLastName} onChange={(e) => set('adminLastName', e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Admin email</Label>
                <InfoTip text="This will be the login email for the School Admin. Should be an official school email address." />
              </div>
              <Input type="email" placeholder="admin@springfield.edu" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Temporary password</Label>
                <InfoTip text="Set a strong temporary password. Ask the admin to change it on first login. Minimum 8 characters." />
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.adminPassword}
                  onChange={(e) => set('adminPassword', e.target.value)}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Onboard school
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function TenantManagement() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<TenantsResponse>({
    queryKey: ['tenants', page],
    queryFn: () => api.get(`/tenants?page=${page}&limit=20`),
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tenant Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Onboard schools onto the VidyaAI platform</p>
        </div>

        <OnboardForm onCreated={() => qc.invalidateQueries({ queryKey: ['tenants'] })} />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="font-display text-base">All Schools</CardTitle>
              {data && <span className="text-sm text-muted-foreground">({data.meta.total})</span>}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Students</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.map((t) => {
                    const licStatus = computeLicenseStatus(t.license)
                    const licStyle = LICENSE_STATUS_STYLES[licStatus]
                    return (
                      <TableRow
                        key={t.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <Link to={`/superadmin/tenants/${t.code}`} className="flex items-center gap-2 group">
                            {!t.isActive && <ShieldOff className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                            {t.name}
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/superadmin/tenants/${t.code}`} className="font-mono text-xs text-primary hover:underline">
                            /{t.code}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant={DEPLOY_VARIANT[t.deploymentMode] ?? 'secondary'} className="text-xs">
                            {DEPLOY_LABEL[t.deploymentMode] ?? t.deploymentMode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.license ? (
                            <div className="flex flex-col gap-1">
                              <span className={cn('inline-block rounded px-1.5 py-0.5 text-xs font-semibold', PLAN_COLORS[t.license.plan])}>
                                {t.license.plan}
                              </span>
                              <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium', licStyle.className)}>
                                {licStyle.label}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.license
                            ? new Date(t.license.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{t._count.users}</TableCell>
                        <TableCell className="text-right tabular-nums text-sm">{t._count.students}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
