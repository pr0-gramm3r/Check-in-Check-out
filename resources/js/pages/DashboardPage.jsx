import { useState, useEffect } from 'react'
import { Users, Clock, UserCheck, UserX, TrendingUp, MapPin, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { StatCard, Badge, Avatar, Button, PageLoader } from '@/components/ui'
import { dashboardService, attendanceService } from '@/services/auth'
import { formatTime, formatDate, timeAgo, getStatusConfig } from '@/utils/helpers'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const EMPTY_STATS = {
  total_employees: 0,
  present_today: 0,
  absent_today: 0,
  late_today: 0,
  on_leave: 0,
  avg_checkin_time: '—',
  attendance_rate: 0,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-card text-xs">
      <p className="font-medium text-surface-700 dark:text-surface-200 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-surface-500 capitalize">{p.name}:</span>
          <span className="font-medium text-surface-800 dark:text-surface-200">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(EMPTY_STATS)
  const [weekly, setWeekly] = useState([])
  const [activity, setActivity] = useState([])
  const [todayStatus, setTodayStatus] = useState({ checked_in: false, check_in_time: null })
  const [loading, setLoading] = useState(true)
  const [checkInLoading, setCheckInLoading] = useState(false)

  const isCheckedIn = todayStatus?.checked_in

  async function loadDashboard() {
    setLoading(true)
    try {
      if (isAdmin) {
        const [statsData, weeklyData, activityData, todayData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getWeeklyChart(),
          dashboardService.getRecentActivity(),
          attendanceService.getToday(),
        ])
        setStats(statsData)
        setWeekly(weeklyData)
        setActivity(activityData)
        setTodayStatus(todayData)
      } else {
        const [todayData, myRecords] = await Promise.all([
          attendanceService.getToday(),
          attendanceService.getMyAttendance(),
        ])
        const today = new Date().toISOString().slice(0, 10)
        const todayRecord = myRecords.find(record => record.date === today)
        setStats({
          total_employees: 1,
          present_today: todayRecord ? 1 : 0,
          absent_today: todayRecord ? 0 : 1,
          late_today: todayRecord?.status === 'late' ? 1 : 0,
          on_leave: 0,
          avg_checkin_time: todayRecord?.check_in ? formatTime(todayRecord.check_in) : 'â€”',
          attendance_rate: myRecords.length ? 100 : 0,
        })
        setWeekly(buildPersonalWeekly(myRecords))
        setActivity(buildPersonalActivity(myRecords, user))
        setTodayStatus(todayData)
      }
    } catch {
      toast.error('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [isAdmin])

  async function handleCheckInOut() {
    setCheckInLoading(true)
    try {
      if (isCheckedIn) {
        await attendanceService.checkOut({})
        toast.success('Checked out successfully!')
        setTodayStatus(s => ({ ...s, checked_in: false, check_out_time: new Date().toISOString() }))
        loadDashboard()
      } else {
        await attendanceService.checkIn({ location: 'Office' })
        toast.success('Checked in successfully!')
        setTodayStatus(s => ({ ...s, checked_in: true, check_in_time: new Date().toISOString() }))
        loadDashboard()
      }
    } catch {
      toast.error('Failed to record attendance.')
    } finally {
      setCheckInLoading(false)
    }
  }

  const rateArr = [
    { month: 'Aug', rate: 88 }, { month: 'Sep', rate: 91 }, { month: 'Oct', rate: 85 },
    { month: 'Nov', rate: 93 }, { month: 'Dec', rate: 87 }, { month: 'Jan', rate: 82 },
    { month: 'Feb', rate: 89 }, { month: 'Mar', rate: 92 },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-surface-500 mt-0.5">{formatDate(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        {/* Quick Check-in */}
        <div className="flex items-center gap-3">
          {isCheckedIn && (
            <div className="flex items-center gap-2 text-sm text-success-600 dark:text-success-400">
              <span className="live-dot" />
              <span>Checked in {formatTime(todayStatus.check_in_time)}</span>
            </div>
          )}
          <Button
            onClick={handleCheckInOut}
            loading={checkInLoading}
            variant={isCheckedIn ? 'secondary' : 'primary'}
            size="md"
          >
            <Clock size={15} />
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isAdmin ? 'Total Employees' : 'Your Profile'}
          value={stats.total_employees}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50 dark:bg-brand-900/30"
          sub={isAdmin ? 'Across all departments' : user?.department || 'Unassigned'}
        />
        <StatCard
          label="Present Today"
          value={stats.present_today}
          icon={UserCheck}
          iconColor="text-success-600"
          iconBg="bg-success-50 dark:bg-success-900/30"
          sub={isAdmin ? `${stats.attendance_rate}% attendance rate` : 'Your attendance today'}
          trend={4}
        />
        <StatCard
          label="Absent"
          value={stats.absent_today}
          icon={UserX}
          iconColor="text-danger-600"
          iconBg="bg-danger-50 dark:bg-danger-900/30"
          sub={isAdmin ? `${stats.on_leave} on approved leave` : 'For today'}
          trend={-2}
        />
        <StatCard
          label="Late Arrivals"
          value={stats.late_today}
          icon={Clock}
          iconColor="text-warning-600"
          iconBg="bg-warning-50 dark:bg-warning-900/30"
          sub={isAdmin ? `Avg check-in: ${stats.avg_checkin_time}` : `Check-in: ${stats.avg_checkin_time}`}
        />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly bar chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Weekly Overview</h2>
              <p className="text-xs text-surface-400 mt-0.5">Present vs absent — this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-surface-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand-500" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-surface-200 dark:bg-surface-700" /> Absent</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-surface-400" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-surface-400" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-surface-100 dark:text-surface-800', opacity: 0.5 }} />
              <Bar dataKey="present" fill="#4f46e5" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent" fill="#e2e8f0" radius={[3, 3, 0, 0]} className="dark:fill-surface-700" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly rate trend */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Attendance Rate</h2>
            <p className="text-xs text-surface-400 mt-0.5">Monthly trend</p>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-semibold text-surface-900 dark:text-surface-100">
              {stats.attendance_rate}%
            </span>
            <span className="text-xs text-success-600 font-medium">↑ 3% this month</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={rateArr}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-surface-400" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} fill="url(#rateGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
              <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">{isAdmin ? 'Live Activity' : 'Your Activity'}</h2>
          </div>
          <button className="btn-ghost btn-sm gap-1.5">
            <RefreshCw size={13} />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
        <div className="divide-y divide-surface-100 dark:divide-surface-800">
          {activity.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-surface-400">No attendance activity yet.</div>
          ) : activity.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <Avatar name={item.employee.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{item.employee.name}</p>
                <p className="text-xs text-surface-400 truncate">{item.employee.department}</p>
              </div>
              <Badge variant={item.type === 'check_in' ? 'success' : 'surface'} dot>
                {item.type === 'check_in' ? 'Check In' : 'Check Out'}
              </Badge>
              <span className="text-xs text-surface-400 shrink-0 hidden sm:block">{timeAgo(item.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function buildPersonalWeekly(records) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)
    const present = records.some(record => record.date === key) ? 1 : 0

    return {
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      present,
      absent: present ? 0 : 1,
    }
  })
}

function buildPersonalActivity(records, user) {
  return records.flatMap((record) => {
    const employee = record.employee || user || { name: 'You', department: 'Unassigned' }
    const events = record.check_in ? [{
      id: `${record.id}-in`,
      employee,
      type: 'check_in',
      time: record.check_in,
    }] : []

    if (record.check_out) {
      events.push({
        id: `${record.id}-out`,
        employee,
        type: 'check_out',
        time: record.check_out,
      })
    }

    return events
  }).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10)
}
