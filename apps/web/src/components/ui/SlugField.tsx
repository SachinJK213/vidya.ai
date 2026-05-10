import { useEffect, useRef, useState } from 'react'
import { Lock, Unlock, Loader2, CheckCircle2, XCircle, KeyRound, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { InfoTip } from './InfoTip'
import { api } from '@/lib/api'

type CheckStatus = 'idle' | 'checking' | 'available' | 'taken'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
    .replace(/-$/, '')
}

interface SlugFieldProps {
  value: string
  onChange: (v: string) => void
  derivedFrom: string
}

export function SlugField({ value, onChange, derivedFrom }: SlugFieldProps) {
  const [locked, setLocked] = useState(true)
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-derive slug from school name when locked
  useEffect(() => {
    if (!locked) return
    const slug = toSlug(derivedFrom)
    onChange(slug)
  }, [derivedFrom, locked])

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value || value.length < 2) {
      setStatus('idle')
      return
    }
    setStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ available: boolean }>(`/tenants/check-code?code=${value}`)
        setStatus(res.available ? 'available' : 'taken')
      } catch {
        setStatus('idle')
      }
    }, 450)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  function handleUnlock() {
    setLocked(false)
    setStatus('idle')
  }

  function handleLock() {
    setLocked(true)
    setStatus('idle')
    onChange(toSlug(derivedFrom))
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    onChange(clean)
  }

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const showPreview = value.length >= 2 && (locked || status === 'available')

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>School code</Label>
        <InfoTip text="A unique slug used on the login page. Lowercase letters, numbers and hyphens only. Auto-generated from the school name — unlock to customise. Cannot be changed after onboarding." />
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={value}
          readOnly={locked}
          onChange={handleInput}
          placeholder="auto-generated"
          className={cn(
            'h-10 w-full rounded-lg border px-3 pr-16 font-mono text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
            locked
              ? 'cursor-default border-border bg-muted/40 text-muted-foreground'
              : 'border-input bg-background',
            !locked && status === 'available' && 'border-emerald-400 focus:ring-emerald-400',
            !locked && status === 'taken' && 'border-destructive focus:ring-destructive',
          )}
        />

        {/* Right-side icon cluster */}
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {/* Status icon */}
          {status === 'checking' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === 'available' && !locked && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          {status === 'taken' && !locked && (
            <XCircle className="h-4 w-4 text-destructive" />
          )}

          {/* Divider */}
          <span className="h-4 w-px bg-border" />

          {/* Lock toggle */}
          <button
            type="button"
            onClick={locked ? handleUnlock : handleLock}
            className={cn(
              'rounded p-0.5 transition-colors',
              locked
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-primary hover:text-primary/70',
            )}
            title={locked ? 'Unlock to customise' : 'Lock to auto-generate'}
          >
            {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Sub-label */}
      <div className="flex h-4 items-center">
        {locked && (
          <p className="text-xs text-muted-foreground">Auto-generated from school name</p>
        )}
        {!locked && status === 'idle' && value.length < 2 && (
          <p className="text-xs text-muted-foreground">Enter a unique code for this school</p>
        )}
        {!locked && status === 'checking' && (
          <p className="text-xs text-muted-foreground">Checking availability…</p>
        )}
        {!locked && status === 'available' && (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Available
          </p>
        )}
        {!locked && status === 'taken' && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <XCircle className="h-3 w-3" /> Already taken — try a different code
          </p>
        )}
      </div>

      {/* Login preview card */}
      {showPreview && (
        <div className="flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Staff log in using school code</p>
              <p className="font-mono text-sm font-semibold text-primary">{value}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors',
              copied
                ? 'text-emerald-600'
                : 'text-primary/70 hover:bg-primary/10 hover:text-primary',
            )}
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5" /> Copied!</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
