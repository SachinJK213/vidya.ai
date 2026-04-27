import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/lib/enums'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  CalendarCheck,
  Bell,
  BookOpen,
  FileText,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  roles: Role[]
}

const navItems: NavItem[] = [
  // Parent
  { label: 'My Children', href: '/parent', icon: <Users className="h-4 w-4" />, roles: [Role.PARENT] },
  { label: 'Notifications', href: '/parent/notifications', icon: <Bell className="h-4 w-4" />, roles: [Role.PARENT] },
  // Teacher
  { label: 'Mark Attendance', href: '/teacher/attendance', icon: <CalendarCheck className="h-4 w-4" />, roles: [Role.TEACHER, Role.SCHOOL_ADMIN] },
  { label: 'AI Drafts', href: '/teacher/drafts', icon: <FileText className="h-4 w-4" />, roles: [Role.TEACHER, Role.SCHOOL_ADMIN] },
  // Admin
  { label: 'Dashboard', href: '/admin', icon: <BookOpen className="h-4 w-4" />, roles: [Role.SCHOOL_ADMIN, Role.SUPER_ADMIN] },
]

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const visible = navItems.filter((n) => user && n.roles.includes(user.role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-16 items-center border-b px-4">
          <span className="text-lg font-bold text-primary">VidyaAI</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {visible.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <span className="text-lg font-bold text-primary">VidyaAI</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex border-t bg-background md:hidden">
          {visible.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
                location.pathname === item.href ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
