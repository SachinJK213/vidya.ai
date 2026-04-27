import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { formatDateTime } from '@/lib/utils'
import { Loader2, CheckCircle, FileText } from 'lucide-react'

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
  const isDraftPending = draft.status === 'PENDING'

  return (
    <Card className={isDraftPending ? 'border-amber-200 bg-amber-50/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">{typeLabel(draft.type)}</Badge>
              <Badge variant={isDraftPending ? 'warning' : 'success'}>
                {isDraftPending ? 'Awaiting approval' : 'Approved'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(draft.createdAt)}</p>
          </div>
          {isDraftPending && (
            <Button size="sm" onClick={() => onApprove(draft.id)}>
              <CheckCircle className="mr-1 h-3 w-3" />
              Approve & Send
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {payload.studentName && (
          <p className="text-sm">
            <span className="text-muted-foreground">Student: </span>
            <span className="font-medium">{payload.studentName}</span>
            {payload.grade && <span className="text-muted-foreground"> · Grade {payload.grade}</span>}
          </p>
        )}
        {payload.absentDate && (
          <p className="text-sm">
            <span className="text-muted-foreground">Absent on: </span>
            {payload.absentDate}
          </p>
        )}
        {payload.message && (
          <div className="rounded-md border bg-white p-3">
            <p className="text-sm italic text-muted-foreground">AI Draft:</p>
            <p className="text-sm">{payload.message}</p>
          </div>
        )}
        {payload.aiSummary && (
          <div className="rounded-md border bg-white p-3">
            <p className="text-sm italic text-muted-foreground">AI Summary:</p>
            <p className="text-sm">{payload.aiSummary}</p>
          </div>
        )}
      </CardContent>
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Drafts</h1>
          <p className="text-muted-foreground">Review and approve AI-generated messages before they are sent to parents</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {!isLoading && data?.data.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No drafts pending approval</p>
              <p className="text-sm text-muted-foreground">
                AI drafts will appear here when students are marked absent.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {data?.data.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onApprove={(id) => approve(id)}
            />
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
