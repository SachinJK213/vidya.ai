import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'
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

const statusVariant: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  PRESENT: 'success',
  ABSENT: 'destructive',
  LATE: 'warning',
  EXCUSED: 'secondary',
}

export default function AttendanceHistory() {
  const { studentId } = useParams<{ studentId: string }>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<AttendanceResponse>({
    queryKey: ['student-attendance', studentId, page],
    queryFn: () =>
      api.get(`/attendance/student/${studentId}?page=${page}&limit=30`),
    enabled: !!studentId,
  })

  const present = data?.data.filter((r) => r.status === 'PRESENT').length ?? 0
  const total = data?.data.length ?? 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/parent">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Attendance History</h1>
            <p className="text-muted-foreground">Last {total} records</p>
          </div>
        </div>

        {total > 0 && (
          <div className="flex gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-600">{present}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-600">{total - present}</div>
                <div className="text-sm text-muted-foreground">Absent / Late</div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">
                  {total > 0 ? Math.round((present / total) * 100) : '—'}%
                </div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                  {data?.data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[record.status] ?? 'secondary'}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {record.markedBy.firstName} {record.markedBy.lastName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {record.note ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
