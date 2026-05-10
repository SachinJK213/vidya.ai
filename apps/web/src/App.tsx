import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Role } from '@/lib/enums'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import LoginPage from '@/pages/login/LoginPage'
import MfaVerifyPage from '@/pages/auth/MfaVerifyPage'
import MagicLinkLandingPage from '@/pages/auth/MagicLinkLandingPage'
import ParentDashboard from '@/pages/parent/ParentDashboard'
import AttendanceHistory from '@/pages/parent/AttendanceHistory'
import ParentNotifications from '@/pages/parent/ParentNotifications'
import MarkAttendance from '@/pages/teacher/MarkAttendance'
import AiDrafts from '@/pages/teacher/AiDrafts'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UserManagement from '@/pages/admin/UserManagement'
import StudentManagement from '@/pages/admin/StudentManagement'
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard'
import TenantManagement from '@/pages/superadmin/TenantManagement'
import TenantDetail from '@/pages/superadmin/TenantDetail'
import AccountSettings from '@/pages/account/AccountSettings'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function RoleRouter() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role === Role.PARENT) return <Navigate to="/parent" replace />
  if (user?.role === Role.TEACHER) return <Navigate to="/teacher/attendance" replace />
  if (user?.role === Role.SUPER_ADMIN) return <Navigate to="/superadmin" replace />
  if (user?.role === Role.SCHOOL_ADMIN) return <Navigate to="/admin" replace />

  return <Navigate to="/login" replace />
}

function RequireAuth({ roles }: { roles?: Role[] }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return null
}

const ADMIN_ROLES = [Role.SCHOOL_ADMIN]

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/mfa" element={<MfaVerifyPage />} />
            <Route path="/auth/magic" element={<MagicLinkLandingPage />} />
            <Route path="/" element={<RoleRouter />} />

            {/* Parent */}
            <Route path="/parent" element={<><RequireAuth roles={[Role.PARENT]} /><ParentDashboard /></>} />
            <Route path="/parent/attendance/:studentId" element={<><RequireAuth roles={[Role.PARENT]} /><AttendanceHistory /></>} />
            <Route path="/parent/notifications" element={<><RequireAuth roles={[Role.PARENT]} /><ParentNotifications /></>} />

            {/* Teacher */}
            <Route path="/teacher/attendance" element={<><RequireAuth roles={[Role.TEACHER, Role.SCHOOL_ADMIN]} /><MarkAttendance /></>} />
            <Route path="/teacher/drafts" element={<><RequireAuth roles={[Role.TEACHER, Role.SCHOOL_ADMIN]} /><AiDrafts /></>} />

            {/* Admin */}
            <Route path="/admin" element={<><RequireAuth roles={ADMIN_ROLES} /><AdminDashboard /></>} />
            <Route path="/admin/users" element={<><RequireAuth roles={ADMIN_ROLES} /><UserManagement /></>} />
            <Route path="/admin/students" element={<><RequireAuth roles={ADMIN_ROLES} /><StudentManagement /></>} />

            {/* Super Admin */}
            <Route path="/superadmin" element={<><RequireAuth roles={[Role.SUPER_ADMIN]} /><SuperAdminDashboard /></>} />
            <Route path="/superadmin/tenants" element={<><RequireAuth roles={[Role.SUPER_ADMIN]} /><TenantManagement /></>} />
            <Route path="/superadmin/tenants/:code" element={<><RequireAuth roles={[Role.SUPER_ADMIN]} /><TenantDetail /></>} />

            {/* Account */}
            <Route path="/account/settings" element={<><RequireAuth /><AccountSettings /></>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
