import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]',
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

interface ToastState {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toastListeners: Array<(toasts: ToastState[]) => void> = []
let toastList: ToastState[] = []

function notifyListeners() {
  toastListeners.forEach((l) => l([...toastList]))
}

export function toast(opts: Omit<ToastState, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastList = [...toastList, { ...opts, id }]
  notifyListeners()
  setTimeout(() => {
    toastList = toastList.filter((t) => t.id !== id)
    notifyListeners()
  }, 4000)
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  React.useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      const idx = toastListeners.indexOf(setToasts)
      if (idx > -1) toastListeners.splice(idx, 1)
    }
  }, [])

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <ToastPrimitive.Root
          key={id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
            variant === 'destructive'
              ? 'border-destructive bg-destructive text-destructive-foreground'
              : 'border bg-background text-foreground',
          )}
        >
          <div className="grid gap-1">
            {title && <ToastPrimitive.Title className="text-sm font-semibold">{title}</ToastPrimitive.Title>}
            {description && (
              <ToastPrimitive.Description className="text-sm opacity-90">
                {description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
