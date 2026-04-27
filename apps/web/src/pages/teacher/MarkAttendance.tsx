import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Loader2, Save } from 'lucide-react'
import { AttendanceStatus } from '@/lib/enums'

interface Student {
  id: string
  firstName: string
  lastName: string
  admissionNo: string
  grade: string
  section: string | null
  rollNo: string | null
  attendance: {
    status: AttendanceStatus
    note: string | null
  } | null
}

const STATUS_OPTIONS: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
  AttendanceStatus.EXCUSED,
]

const statusStyle: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  [AttendanceStatus.ABSENT]: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  [AttendanceStatus.LATE]: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
  [AttendanceStatus.EXCUSED]: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
}

export default function MarkAttendance() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const qc = useQueryClient()

  const params = new URLSearchParams({ date })
  if (grade) params.set('grade', grade)
  if (section) params.set('section', section)
  params.set('limit', '100')

  const { data: students, isLoading, isFetching } = useQuery<Student[]>({
    queryKey: ['attendance-sheet', date, grade, section],
    queryFn: () => api.get<Student[]>(`/attendance?${params}`),
    enabled: !!date,
  })

  useEffect(() => {
    if (!students) return
    setStatuses((prev) => {
      const seeded: Record<string, AttendanceStatus> = {}
      students.forEach((s) => {
        if (s.attendance && !prev[s.id]) seeded[s.id] = s.attendance.status
      })
      return Object.keys(seeded).length ? { ...prev, ...seeded } : prev
    })
  }, [students])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const entries = (students ?? []).map((s) => ({
        studentId: s.id,
        status: statuses[s.id] ?? AttendanceStatus.PRESENT,
      }))
      return api.post('/attendance/mark', { date, entries })
    },
    onSuccess: () => {
      toast({ title: 'Attendance saved', description: `${formatDate(date)} recorded.` })
      qc.invalidateQueries({ queryKey: ['attendance-sheet'] })
    },
    onError: (err: Error) => {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' })
    },
  })

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {}
    students?.forEach((s) => { next[s.id] = status })
    setStatuses(next)
  }

  const presentCount = Object.values(statuses).filter((s) => s === AttendanceStatus.PRESENT).length
  const absentCount = Object.values(statuses).filter((s) => s === AttendanceStatus.ABSENT).length

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground">Select a date and class to begin</p>
          </div>
          <Button onClick={() => save()} disabled={isPending || !students?.length}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setStatuses({}) }}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label>Grade</Label>
                <Input
                  placeholder="e.g. 5"
                  value={grade}
                  onChange={(e) => { setGrade(e.target.value); setStatuses({}) }}
                  className="w-24"
                />
              </div>
              <div className="space-y-1">
                <Label>Section</Label>
                <Input
                  placeholder="e.g. A"
                  value={section}
                  onChange={(e) => { setSection(e.target.value); setStatuses({}) }}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary + bulk actions */}
        {students && students.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">{presentCount} Present</Badge>
            <Badge variant="destructive">{absentCount} Absent</Badge>
            <span className="text-sm text-muted-foreground">{students.length} students</span>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAll(AttendanceStatus.PRESENT)}>
                All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll(AttendanceStatus.ABSENT)}>
                All Absent
              </Button>
            </div>
          </div>
        )}

        {/* Attendance sheet */}
        <Card>
          <CardContent className="p-0">
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !students?.length ? (
              <div className="py-16 text-center text-muted-foreground">
                No students found. Adjust grade/section filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground text-sm">{s.rollNo ?? idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">#{s.admissionNo}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {STATUS_OPTIONS.map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: st }))}
                              className={cn(
                                'rounded border px-2 py-0.5 text-xs font-medium transition-colors',
                                statuses[s.id] === st
                                  ? statusStyle[st]
                                  : 'border-transparent text-muted-foreground hover:bg-muted',
                              )}
                            >
                              {st[0]}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
