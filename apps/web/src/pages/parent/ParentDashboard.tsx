import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Users, ChevronRight, Loader2 } from 'lucide-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade: string
  section: string | null
  admissionNo: string
  isActive: boolean
}

interface WeeklySummary {
  totalDays: number
  presentDays: number
  attendancePct: number | null
}

function mondayOfCurrentWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(new Date().setDate(diff)).toISOString().split('T')[0]
}

function StudentCard({ student }: { student: Student }) {
  const weekStart = mondayOfCurrentWeek()

  const { data: summary, isLoading } = useQuery<WeeklySummary>({
    queryKey: ['weekly-summary', student.id, weekStart],
    queryFn: () =>
      api.get(`/attendance/student/${student.id}/weekly-summary?weekStart=${weekStart}`),
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {student.firstName} {student.lastName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Grade {student.grade}
              {student.section ? ` · Section ${student.section}` : ''} · #{student.admissionNo}
            </p>
          </div>
          <Badge variant={student.isActive ? 'success' : 'secondary'}>
            {student.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading this week…
          </div>
        ) : summary ? (
          <div className="mb-3 flex gap-4 text-sm">
            <div>
              <span className="font-semibold text-green-600">{summary.presentDays}</span>
              <span className="text-muted-foreground">/{summary.totalDays} days</span>
            </div>
            {summary.attendancePct !== null && (
              <Badge
                variant={
                  summary.attendancePct >= 75
                    ? 'success'
                    : summary.attendancePct >= 50
                      ? 'warning'
                      : 'destructive'
                }
              >
                {summary.attendancePct}% this week
              </Badge>
            )}
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">No attendance data this week</p>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link to={`/parent/attendance/${student.id}`} className="flex items-center gap-1">
            View history
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ParentDashboard() {
  const { user } = useAuth()

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: ['parent-students', user?.sub],
    queryFn: () => api.get<Student[]>('/students/my-children'),
    enabled: !!user,
  })

  const allStudents = students ?? []

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Children</h1>
          <p className="text-muted-foreground">Weekly attendance overview</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        )}

        {allStudents.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No students linked</p>
              <p className="text-sm text-muted-foreground">
                Contact the school admin to link your children to your account.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allStudents.map((s) => (
            <StudentCard key={s.id} student={s} />
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
