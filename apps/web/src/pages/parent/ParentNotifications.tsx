import { useQuery } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Bell, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

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

function typeLabel(type: string) {
  const map: Record<string, string> = {
    ABSENCE_ALERT: 'Absence Alert',
    ANNOUNCEMENT: 'Announcement',
    EMERGENCY: 'Emergency',
    AI_WEEKLY_SUMMARY: 'Weekly Summary',
    AI_DRAFT_MESSAGE: 'Message',
  }
  return map[type] ?? type
}

function typeVariant(type: string): 'destructive' | 'warning' | 'default' | 'success' {
  if (type === 'EMERGENCY') return 'destructive'
  if (type === 'ABSENCE_ALERT') return 'warning'
  if (type === 'ANNOUNCEMENT') return 'default'
  return 'success'
}

function NotificationCard({ n }: { n: NotificationEvent }) {
  const payload = n.payload as any
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={typeVariant(n.type)}>{typeLabel(n.type)}</Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
            </div>
            {n.type === 'ABSENCE_ALERT' && (
              <p className="text-sm">
                {payload.message ??
                  `${payload.studentName} was absent on ${payload.absentDate}.`}
              </p>
            )}
            {n.type === 'ANNOUNCEMENT' && (
              <>
                <p className="font-medium text-sm">{payload.subject}</p>
                <p className="text-sm text-muted-foreground">{payload.body}</p>
              </>
            )}
            {n.type === 'EMERGENCY' && (
              <p className="text-sm font-medium text-red-600">{payload.message}</p>
            )}
            {n.type === 'AI_WEEKLY_SUMMARY' && (
              <p className="text-sm">{payload.aiSummary}</p>
            )}
          </div>
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
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Messages from the school</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No notifications yet</p>
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
