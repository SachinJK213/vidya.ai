import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Role } from '@/lib/enums'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LogOut,
  CalendarCheck,
  Bell,
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  Building2,
  BarChart3,
  Settings,
  ChevronDown,
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
  { label: 'My Children',       href: '/parent',               icon: <Users className="h-4 w-4" />,           roles: [Role.PARENT] },
  { label: 'Notifications',     href: '/parent/notifications', icon: <Bell className="h-4 w-4" />,            roles: [Role.PARENT] },
  { label: 'Mark Attendance',   href: '/teacher/attendance',   icon: <CalendarCheck className="h-4 w-4" />,   roles: [Role.TEACHER, Role.SCHOOL_ADMIN] },
  { label: 'AI Drafts',         href: '/teacher/drafts',       icon: <FileText className="h-4 w-4" />,        roles: [Role.TEACHER, Role.SCHOOL_ADMIN] },
  { label: 'Dashboard',         href: '/admin',                icon: <LayoutDashboard className="h-4 w-4" />, roles: [Role.SCHOOL_ADMIN] },
  { label: 'Users',             href: '/admin/users',          icon: <UserCog className="h-4 w-4" />,         roles: [Role.SCHOOL_ADMIN] },
  { label: 'Students',          href: '/admin/students',       icon: <BookOpen className="h-4 w-4" />,        roles: [Role.SCHOOL_ADMIN] },
  { label: 'Overview',          href: '/superadmin',           icon: <BarChart3 className="h-4 w-4" />,       roles: [Role.SUPER_ADMIN] },
  { label: 'Schools',           href: '/superadmin/tenants',   icon: <Building2 className="h-4 w-4" />,       roles: [Role.SUPER_ADMIN] },
]

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split('@')[0]
    .split(/[._-]/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className={cn(
      'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-primary/20',
      size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs',
    )}>
      {initials || '?'}
    </div>
  )
}

function roleLabel(role: Role) {
  return role.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function UserMenu({ side = 'bottom' }: { side?: 'bottom' | 'top' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <UserAvatar name={user?.email ?? ''} />
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-foreground leading-none truncate max-w-[120px]">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {user?.role ? roleLabel(user.role) : ''}
            </p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5">
            <UserAvatar name={user?.email ?? ''} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.role ? roleLabel(user.role) : ''}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/account/settings')}>
          <Settings className="h-4 w-4 text-muted-foreground" />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  const visible = navItems.filter((n) => user && n.roles.includes(user.role))

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — navigation only, no user section */}
      <aside className="hidden w-56 flex-col border-r border-border bg-card md:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground">VidyaAI</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <p className="mb-1 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          {visible.map((item) => {
            const exactOnly = item.href === '/superadmin'
            const isActive =
              location.pathname === item.href ||
              (!exactOnly && item.href !== '/' && location.pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Right side: top header + content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header — always visible, user menu top-right */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">VidyaAI</span>
          </div>

          {/* Desktop: spacer so user menu sits far right */}
          <div className="hidden md:block" />

          {/* User menu — always top-right */}
          <UserMenu side="bottom" />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="flex border-t border-border bg-card md:hidden">
          {visible.map((item) => {
            const exactOnly = item.href === '/superadmin'
            const isActive =
              location.pathname === item.href ||
              (!exactOnly && item.href !== '/' && location.pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
