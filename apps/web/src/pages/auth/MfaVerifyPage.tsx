import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/ui/OtpInput'
import { Loader2, GraduationCap, MailOpen, ArrowLeft, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MfaVerifyPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [devCode, setDevCode] = useState<string | null>(null)

  const mfaToken = sessionStorage.getItem('vidya_mfa_token') ?? ''

  useEffect(() => {
    if (!mfaToken) navigate('/login', { replace: true })
    const stored = sessionStorage.getItem('vidya_dev_otp')
    if (stored) { setDevCode(stored); sessionStorage.removeItem('vidya_dev_otp') }
  }, [mfaToken, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function handleVerify() {
    if (code.length < 6) return
    setLoading(true)
    try {
      const res = await api.post<{ accessToken: string }>('/auth/mfa/verify', { mfaToken, code })
      sessionStorage.removeItem('vidya_mfa_token')
      loginWithToken(res.accessToken)
      navigate('/', { replace: true })
    } catch (err: any) {
      toast({ title: 'Invalid code', description: err.message ?? 'Please try again.', variant: 'destructive' })
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      const res = await api.post<any>('/auth/mfa/send', { mfaToken })
      sessionStorage.setItem('vidya_mfa_token', res.mfaToken)
      if (res._devCode) setDevCode(res._devCode)
      setCode('')
      setResendCooldown(60)
      toast({ title: 'New code sent', description: 'Check your email.' })
    } catch (err: any) {
      toast({ title: 'Could not resend', description: err.message, variant: 'destructive' })
    } finally {
      setResending(false)
    }
  }

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (code.length === 6 && !loading) handleVerify()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-primary">VidyaAI</span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <MailOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to your email. Enter it below to sign in.
          </p>
        </div>


        {/* OTP Input */}
        <div className="space-y-2">
          <OtpInput value={code} onChange={setCode} disabled={loading} />
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Verifying…
            </div>
          )}
        </div>

        {/* Verify button */}
        <Button
          onClick={handleVerify}
          disabled={code.length < 6 || loading}
          className="h-11 w-full font-medium"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify and sign in'}
        </Button>

        {/* Resend + Back */}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </button>
          <button
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              resendCooldown > 0 || resending
                ? 'cursor-default text-muted-foreground'
                : 'text-primary hover:text-primary/80',
            )}
          >
            {resending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  )
}
