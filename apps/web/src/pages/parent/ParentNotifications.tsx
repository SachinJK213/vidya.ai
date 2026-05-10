import { useQuery } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Bell, Loader2, AlertTriangle, Megaphone, Sparkles, UserX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationEvent {
  id: string
  type: string
  status: string
  payload: Record<string, unknown>
  isAiDraft: boolean
  sentAt: string | null
  createdAt: string
}

interface NotificationsResponse {
  data: NotificationEvent[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const TYPE_CONFIG: Record<string, {
  label: string
  variant: 'destructive' | 'warning' | 'default' | 'success'
  icon: React.ReactNode
  borderClass: string
}> = {
  EMERGENCY: {
    label: 'Emergency',
    variant: 'destructive',
    icon: <AlertTriangle className="h-4 w-4" />,
    borderClass: 'border-l-red-500',
  },
  ABSENCE_ALERT: {
    label: 'Absence Alert',
    variant: 'warning',
    icon: <UserX className="h-4 w-4" />,
    borderClass: 'border-l-amber-400',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    variant: 'default',
    icon: <Megaphone className="h-4 w-4" />,
    borderClass: 'border-l-primary',
  },
  AI_WEEKLY_SUMMARY: {
    label: 'Weekly Summary',
    variant: 'default',
    icon: <Sparkles className="h-4 w-4" />,
    borderClass: 'border-l-indigo-400',
  },
  AI_DRAFT_MESSAGE: {
    label: 'Message',
    variant: 'success',
    icon: <Bell className="h-4 w-4" />,
    borderClass: 'border-l-emerald-400',
  },
}

function NotificationCard({ n }: { n: NotificationEvent }) {
  const payload = n.payload as any
  const config = TYPE_CONFIG[n.type] ?? {
    label: n.type,
    variant: 'default' as const,
    icon: <Bell className="h-4 w-4" />,
    borderClass: 'border-l-border',
  }

  return (
    <Card className={cn('border-l-4', config.borderClass)}>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={config.variant} className="flex items-center gap-1.5">
              {config.icon}
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(n.createdAt)}</span>
          </div>

          {n.type === 'EMERGENCY' && (
            <p className="text-sm font-semibold text-destructive">{payload.message}</p>
          )}
          {n.type === 'ABSENCE_ALERT' && (
            <p className="text-sm text-foreground">
              {payload.message ?? `${payload.studentName} was absent on ${payload.absentDate}.`}
            </p>
          )}
          {n.type === 'ANNOUNCEMENT' && (
            <div>
              <p className="text-sm font-semibold text-foreground">{payload.subject}</p>
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{payload.body}</p>
            </div>
          )}
          {(n.type === 'AI_WEEKLY_SUMMARY' || n.type === 'AI_DRAFT_MESSAGE') && (
            <p className="text-sm text-foreground leading-relaxed">{payload.aiSummary ?? payload.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ParentNotifications() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['my-notifications', page],
    queryFn: () => api.get(`/notifications/my?page=${page}&limit=20`),
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Messages from the school</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notifications…
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Bell className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">No notifications yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  School announcements and alerts will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {data?.data.map((n) => <NotificationCard key={n.id} n={n} />)}
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {data.meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
