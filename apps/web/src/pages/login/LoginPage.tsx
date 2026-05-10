import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, MfaRequiredError } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'
import { Eye, EyeOff, Loader2, CheckCircle2, GraduationCap, Sparkles, Mail } from 'lucide-react'
import { InfoTip } from '@/components/ui/InfoTip'
import { cn } from '@/lib/utils'

const BENEFITS = [
  'Real-time attendance tracking for every student',
  'AI-drafted parent notifications, human-approved',
  'Emergency alerts reach all families instantly',
]

type Mode = 'password' | 'magic'
type MagicState = 'idle' | 'sending' | 'sent'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('password')
  const [tenantCode, setTenantCode] = useState(() => localStorage.getItem('vidya_tenant') ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicState, setMagicState] = useState<MagicState>('idle')
  const [devToken, setDevToken] = useState<string | null>(null)

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tenantCode.trim()) {
      toast({ title: 'School code required', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await login(tenantCode.trim().toLowerCase(), email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof MfaRequiredError) {
        sessionStorage.setItem('vidya_mfa_token', err.mfaToken)
        sessionStorage.setItem('vidya_tenant_pending', tenantCode.trim().toLowerCase())
        if (err._devCode) sessionStorage.setItem('vidya_dev_otp', err._devCode)
        navigate('/auth/mfa')
        return
      }
      toast({
        title: 'Sign in failed',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tenantCode.trim()) {
      toast({ title: 'School code required', variant: 'destructive' })
      return
    }
    setMagicState('sending')
    try {
      const res = await api.post<any>('/auth/magic/request', {
        tenantCode: tenantCode.trim().toLowerCase(),
        email,
      })
      if (res._devToken) setDevToken(res._devToken)
      setMagicState('sent')
    } catch (err: any) {
      toast({ title: 'Failed to send link', description: err.message, variant: 'destructive' })
      setMagicState('idle')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">VidyaAI</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight">
              AI-first school&nbsp;management
            </h1>
            <p className="mt-3 text-lg text-primary-foreground/80">
              One platform for teachers, parents, and administrators.
            </p>
          </div>
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white/90" />
                <span className="text-sm text-primary-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} VidyaAI</p>
      </div>

      {/* Right — Form */}
      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-primary">VidyaAI</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your school account</p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl border border-border bg-muted p-1 gap-1">
            {([
              { id: 'password', label: 'Password', icon: <Eye className="h-3.5 w-3.5" /> },
              { id: 'magic', label: 'Magic link', icon: <Sparkles className="h-3.5 w-3.5" /> },
            ] as const).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMode(m.id); setMagicState('idle'); setDevToken(null) }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  mode === m.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m.icon}{m.label}
              </button>
            ))}
          </div>

          {/* Shared fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="tenant">School code</Label>
                <InfoTip text="Your school's unique identifier on VidyaAI. Ask your administrator if you don't know it." />
              </div>
              <Input
                id="tenant"
                placeholder="e.g. springdale-2024"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                autoComplete="organization"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-11"
              />
            </div>
          </div>

          {/* Password mode */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-11 pr-10"
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
              <Button type="submit" className="h-11 w-full font-medium" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          )}

          {/* Magic link mode */}
          {mode === 'magic' && magicState !== 'sent' && (
            <form onSubmit={handleMagicSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No password needed — we'll email you a secure sign-in link.
              </p>
              <Button
                type="submit"
                className="h-11 w-full font-medium gap-2"
                disabled={magicState === 'sending'}
              >
                {magicState === 'sending'
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Sending link…</>
                  : <><Sparkles className="h-4 w-4" />Send magic link</>}
              </Button>
            </form>
          )}

          {/* Magic link sent state */}
          {mode === 'magic' && magicState === 'sent' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Check your inbox</p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.
                  </p>
                </div>
              </div>

              {devToken && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">Dev mode — magic link token:</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-amber-800">{devToken}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/auth/magic?token=${devToken}&tenant=${tenantCode.trim().toLowerCase()}`)}
                    className="mt-2 text-xs font-semibold text-amber-700 underline"
                  >
                    Click to simulate link →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setMagicState('idle'); setDevToken(null) }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
