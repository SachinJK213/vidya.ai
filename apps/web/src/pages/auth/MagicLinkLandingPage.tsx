import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { GraduationCap, Loader2, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MagicLinkLandingPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = params.get('token')
    const tenant = params.get('tenant')

    if (!token || !tenant) {
      setState('error')
      setErrorMsg('Invalid link — missing parameters.')
      return
    }

    api.post<{ accessToken: string }>('/auth/magic/verify', { token, tenantCode: tenant })
      .then((res) => {
        localStorage.setItem('vidya_tenant', tenant)
        loginWithToken(res.accessToken)
        setState('success')
        setTimeout(() => navigate('/', { replace: true }), 800)
      })
      .catch((err: Error) => {
        setState('error')
        setErrorMsg(err.message ?? 'This link has expired or already been used.')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>

        {state === 'verifying' && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="font-display text-lg font-semibold text-foreground">Signing you in…</p>
            <p className="text-sm text-muted-foreground">Verifying your magic link, please wait.</p>
          </div>
        )}

        {state === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="font-display text-lg font-semibold text-foreground">You're in!</p>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <div>
              <p className="font-display text-lg font-semibold text-foreground">Link expired</p>
              <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            <Button asChild className="w-full">
              <Link to="/login">Back to sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
