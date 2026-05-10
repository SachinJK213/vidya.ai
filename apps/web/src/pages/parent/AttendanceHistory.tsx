import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Loader2, CalendarDays } from 'lucide-react'
import { useState } from 'react'

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  note: string | null
  markedBy: { firstName: string; lastName: string }
}

interface AttendanceResponse {
  data: AttendanceRecord[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

const STATUS_CONFIG: Record<string, { variant: 'success' | 'destructive' | 'warning' | 'secondary'; label: string }> = {
  PRESENT: { variant: 'success', label: 'Present' },
  ABSENT: { variant: 'destructive', label: 'Absent' },
  LATE: { variant: 'warning', label: 'Late' },
  EXCUSED: { variant: 'secondary', label: 'Excused' },
}

function StatChip({ value, label, colorClass }: { value: string | number; label: string; colorClass: string }) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="pt-5 pb-4 text-center">
        <div className={`font-display text-3xl font-bold ${colorClass}`}>{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

export default function AttendanceHistory() {
  const { studentId } = useParams<{ studentId: string }>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<AttendanceResponse>({
    queryKey: ['student-attendance', studentId, page],
    queryFn: () => api.get(`/attendance/student/${studentId}?page=${page}&limit=30`),
    enabled: !!studentId,
  })

  const present = data?.data.filter((r) => r.status === 'PRESENT').length ?? 0
  const absent = data?.data.filter((r) => r.status === 'ABSENT').length ?? 0
  const total = data?.data.length ?? 0
  const pct = total > 0 ? Math.round((present / total) * 100) : null

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/parent">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Attendance History</h1>
            <p className="text-sm text-muted-foreground">Last {total} records</p>
          </div>
        </div>

        {total > 0 && (
          <div className="flex gap-3">
            <StatChip value={`${pct ?? '—'}%`} label="Overall" colorClass="text-foreground" />
            <StatChip value={present} label="Present" colorClass="text-emerald-600" />
            <StatChip value={absent} label="Absent" colorClass="text-destructive" />
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="font-display text-base">Attendance Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !data?.data.length ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No records found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Marked by</TableHead>
                    <TableHead className="hidden md:table-cell">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((record) => {
                    const cfg = STATUS_CONFIG[record.status] ?? { variant: 'secondary' as const, label: record.status }
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {record.markedBy.firstName} {record.markedBy.lastName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {record.note ?? '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
