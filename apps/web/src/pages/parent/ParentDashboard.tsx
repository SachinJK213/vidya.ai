import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { Users, ChevronRight, Loader2, TrendingUp } from 'lucide-react'

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

function StudentInitials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
      {initials}
    </div>
  )
}

function StudentCard({ student }: { student: Student }) {
  const weekStart = mondayOfCurrentWeek()

  const { data: summary, isLoading } = useQuery<WeeklySummary>({
    queryKey: ['weekly-summary', student.id, weekStart],
    queryFn: () =>
      api.get(`/attendance/student/${student.id}/weekly-summary?weekStart=${weekStart}`),
  })

  const pct = summary?.attendancePct ?? null

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <StudentInitials name={`${student.firstName} ${student.lastName}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-foreground truncate">
                {student.firstName} {student.lastName}
              </h3>
              <Badge variant={student.isActive ? 'success' : 'secondary'} className="shrink-0">
                {student.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Grade {student.grade}
              {student.section ? ` · Sec ${student.section}` : ''} · #{student.admissionNo}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading this week…
          </div>
        ) : summary ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">This week</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-foreground">
                {summary.presentDays}
                <span className="text-sm font-normal text-muted-foreground">/{summary.totalDays}</span>
              </span>
              {pct !== null && (
                <Badge
                  variant={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'destructive'}
                >
                  {pct}% present
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendance data this week</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link to={`/parent/attendance/${student.id}`} className="flex items-center justify-center gap-1">
            View attendance history
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Children</h1>
            <p className="mt-1 text-sm text-muted-foreground">Weekly attendance overview</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your children…
          </div>
        )}

        {allStudents.length === 0 && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">No students linked</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contact the school admin to link your children to your account.
                </p>
              </div>
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
