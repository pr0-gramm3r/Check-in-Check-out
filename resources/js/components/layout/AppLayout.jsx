import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardList, BarChart3,
  Settings, LogOut, Menu, X, Sun, Moon, Bell, ChevronDown,
  Clock, Building2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Avatar } from '@/components/ui'
import { cn } from '@/utils/helpers'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/attendance',  icon: Clock,           label: 'Attendance', adminOnly: true },
  { to: '/employees',   icon: Users,           label: 'Employees', adminOnly: true },
  { to: '/departments', icon: Building2,       label: 'Departments', adminOnly: true },
  { to: '/reports',     icon: BarChart3,       label: 'Reports', adminOnly: true },
  { to: '/settings',    icon: Settings,        label: 'Settings', adminOnly: true },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { toggle, isDark } = useTheme()
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800',
        'flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-[60px] px-5 border-b border-surface-200 dark:border-surface-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={16} className="text-white" />
            </div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 text-base tracking-tight">AttendIQ</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn('sidebar-link', isActive && 'active')}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-surface-200 dark:border-surface-800 shrink-0">
          <NavLink to="/profile" className={({ isActive }) => cn('sidebar-link', isActive && 'active')}>
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-surface-900 dark:text-surface-100">{user?.name}</p>
              <p className="text-xs text-surface-400 truncate">{user?.role || 'Employee'}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="sidebar-link w-full mt-0.5 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[60px] bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2 rounded-lg">
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggle} className="btn-ghost btn-sm p-2 rounded-lg">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <button className="btn-ghost btn-sm p-2 rounded-lg relative">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full" />
            </button>

            {/* User pill */}
            <NavLink to="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300">{user?.name?.split(' ')[0]}</span>
              <ChevronDown size={14} className="text-surface-400" />
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
