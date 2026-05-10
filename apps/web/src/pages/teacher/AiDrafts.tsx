import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { formatDateTime } from '@/lib/utils'
import { Loader2, CheckCircle, FileText, Sparkles } from 'lucide-react'

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
  meta: { total: number; page: number; totalPages: number }
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    ABSENCE_ALERT: 'Absence Alert',
    AI_WEEKLY_SUMMARY: 'Weekly Summary',
    AI_DRAFT_MESSAGE: 'Draft Message',
  }
  return map[type] ?? type
}

function DraftCard({ draft, onApprove }: { draft: NotificationEvent; onApprove: (id: string) => void }) {
  const payload = draft.payload as any
  const isPending = draft.status === 'PENDING'

  return (
    <Card className={isPending ? 'border-amber-200 bg-amber-50/60' : 'bg-card'}>
      <div className={`h-full rounded-lg ${isPending ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}>
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning">{typeLabel(draft.type)}</Badge>
                <Badge variant={isPending ? 'warning' : 'success'}>
                  {isPending ? 'Awaiting approval' : 'Approved'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{formatDateTime(draft.createdAt)}</p>
            </div>
            {isPending && (
              <Button size="sm" onClick={() => onApprove(draft.id)} className="shrink-0">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Approve & Send
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5">
          {payload.studentName && (
            <p className="text-sm font-medium text-foreground">
              {payload.studentName}
              {payload.grade && (
                <span className="ml-1 font-normal text-muted-foreground">· Grade {payload.grade}</span>
              )}
            </p>
          )}
          {payload.absentDate && (
            <p className="text-sm text-muted-foreground">
              Absent on: <span className="font-medium text-foreground">{payload.absentDate}</span>
            </p>
          )}
          {(payload.message || payload.aiSummary) && (
            <div className="rounded-lg border border-amber-200 bg-white px-4 py-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">AI Draft</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {payload.message ?? payload.aiSummary}
              </p>
            </div>
          )}
          {!isPending && draft.sentAt && (
            <p className="text-xs text-muted-foreground">
              Sent {formatDateTime(draft.sentAt)}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

export default function AiDrafts() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['ai-drafts', page],
    queryFn: () => api.get(`/notifications/my?page=${page}&limit=20`),
    select: (res) => ({
      ...res,
      data: res.data.filter((n) => n.isAiDraft),
    }),
  })

  const { mutate: approve } = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/approve`),
    onSuccess: () => {
      toast({ title: 'Draft approved', description: 'Message queued for delivery.' })
      qc.invalidateQueries({ queryKey: ['ai-drafts'] })
    },
    onError: (err: Error) => {
      toast({ title: 'Approval failed', description: err.message, variant: 'destructive' })
    },
  })

  const pendingCount = data?.data.filter((d) => d.status === 'PENDING').length ?? 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">AI Drafts</h1>
            {pendingCount > 0 && (
              <Badge variant="warning" className="text-sm">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve AI-generated messages before they are sent to parents
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading drafts…
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">No drafts pending approval</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI drafts appear here when students are marked absent.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {data?.data.map((draft) => (
            <DraftCard key={draft.id} draft={draft} onApprove={(id) => approve(id)} />
          ))}
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
