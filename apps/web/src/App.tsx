import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Role } from '@vidyaai/shared'
import { Toaster } from '@/components/ui/toaster'

import LoginPage from '@/pages/login/LoginPage'
import ParentDashboard from '@/pages/parent/ParentDashboard'
import AttendanceHistory from '@/pages/parent/AttendanceHistory'
import ParentNotifications from '@/pages/parent/ParentNotifications'
import MarkAttendance from '@/pages/teacher/MarkAttendance'
import AiDrafts from '@/pages/teacher/AiDrafts'
import AdminDashboard from '@/pages/admin/AdminDashboard'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function RoleRouter() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role === Role.PARENT) return <Navigate to="/parent" replace />
  if (user?.role === Role.TEACHER) return <Navigate to="/teacher/attendance" replace />
  if (user?.role === Role.SCHOOL_ADMIN || user?.role === Role.SUPER_ADMIN)
    return <Navigate to="/admin" replace />

  return <Navigate to="/login" replace />
}

function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<RoleRouter />} />

            {/* Parent routes */}
            <Route
              path="/parent"
              element={
                <>
                  <RequireAuth roles={[Role.PARENT]} />
                  <ParentDashboard />
                </>
              }
            />
            <Route
              path="/parent/attendance/:studentId"
              element={
                <>
                  <RequireAuth roles={[Role.PARENT]} />
                  <AttendanceHistory />
                </>
              }
            />
            <Route
              path="/parent/notifications"
              element={
                <>
                  <RequireAuth roles={[Role.PARENT]} />
                  <ParentNotifications />
                </>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/attendance"
              element={
                <>
                  <RequireAuth roles={[Role.TEACHER, Role.SCHOOL_ADMIN]} />
                  <MarkAttendance />
                </>
              }
            />
            <Route
              path="/teacher/drafts"
              element={
                <>
                  <RequireAuth roles={[Role.TEACHER, Role.SCHOOL_ADMIN]} />
                  <AiDrafts />
                </>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <>
                  <RequireAuth roles={[Role.SCHOOL_ADMIN, Role.SUPER_ADMIN]} />
                  <AdminDashboard />
                </>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
