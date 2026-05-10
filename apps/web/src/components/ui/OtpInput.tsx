import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, '').slice(0, 6).split('')

  function focus(i: number) {
    refs.current[i]?.focus()
  }

  function handleChange(i: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = digit
    onChange(next.join('').trimEnd())
    if (digit && i < 5) focus(i + 1)
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = ''; onChange(next.join('').trimEnd())
      } else if (i > 0) {
        focus(i - 1)
        const next = [...digits]; next[i - 1] = ''; onChange(next.join('').trimEnd())
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focus(i - 1)
    } else if (e.key === 'ArrowRight' && i < 5) {
      focus(i + 1)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    focus(Math.min(pasted.length, 5))
  }

  return (
    <div className="flex gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={cn(
            'h-14 w-12 rounded-xl border-2 bg-background text-center font-display text-2xl font-bold tabular-nums transition-all',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            digits[i] ? 'border-primary text-primary' : 'border-border text-foreground',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />
      ))}
    </div>
  )
}
