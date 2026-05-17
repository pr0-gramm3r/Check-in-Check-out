import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Button, StatCard, PageLoader } from '@/components/ui'
import { downloadBlob } from '@/utils/helpers'
import { reportService } from '@/services/auth'
import toast from 'react-hot-toast'

const EMPTY_REPORT = {
  summary: {
    avg_attendance_rate: 0,
    total_present_days: 0,
    late_arrivals: 0,
    avg_work_hours_day: 0,
  },
  monthly: [],
  department_attendance: [],
  status_pie: [],
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-card text-xs">
      <p className="font-semibold text-surface-700 dark:text-surface-200 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-surface-400 capitalize">{p.name}:</span>
          <span className="font-medium text-surface-700 dark:text-surface-200">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(EMPTY_REPORT)
  const [lateArrivals, setLateArrivals] = useState([])

  async function loadReports() {
    setLoading(true)
    try {
      const [dashboard, late] = await Promise.all([
        reportService.getDashboard(),
        reportService.getLateArrivals({ period }),
      ])
      setReport(dashboard)
      setLateArrivals(late)
    } catch {
      toast.error('Unable to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [period])

  async function handleExport() {
    setExporting(true)
    try {
      downloadBlob(await reportService.exportCSV(), 'attendance-report.csv')
      toast.success('Report exported as CSV.')
    } catch {
      toast.error('Unable to export report.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm text-surface-500 mt-0.5">Attendance insights from your database</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-36 text-sm" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="quarter">This quarter</option>
            <option value="year">This year</option>
          </select>
          <Button variant="secondary" size="md" onClick={handleExport} loading={exporting}>
            <Download size={15} /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Avg Attendance Rate" value={`${report.summary.avg_attendance_rate}%`} sub="Today" iconColor="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-900/30" />
        <StatCard label="Total Present Days" value={report.summary.total_present_days} sub="All recorded check-ins" iconColor="text-success-600" iconBg="bg-success-50 dark:bg-success-900/20" />
        <StatCard label="Late Arrivals" value={report.summary.late_arrivals} sub="All recorded late check-ins" iconColor="text-warning-600" iconBg="bg-warning-50 dark:bg-warning-900/20" />
        <StatCard label="Avg Work Hours/Day" value={`${report.summary.avg_work_hours_day}h`} sub="Completed sessions" iconColor="text-surface-500" iconBg="bg-surface-100 dark:bg-surface-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Monthly Attendance Trend</h2>
              <p className="text-xs text-surface-400 mt-0.5">Present, absent, and late monthly percentages</p>
            </div>
          </div>
          {report.monthly.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-surface-400">No attendance records yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={report.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-200 dark:text-surface-700" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Today's Status Breakdown</h2>
            <p className="text-xs text-surface-400 mt-0.5">Active employees</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={report.status_pie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {report.status_pie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} employees`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {report.status_pie.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-surface-600 dark:text-surface-400">{s.name}</span>
                </span>
                <span className="font-medium text-surface-700 dark:text-surface-300">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Attendance by Department</h2>
            <p className="text-xs text-surface-400 mt-0.5">Average rate this month</p>
          </div>
          {report.department_attendance.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-surface-400">No departments yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.department_attendance} layout="vertical" barSize={12}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-surface-200 dark:text-surface-700" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
                <Bar dataKey="rate" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-700">
            <h2 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Frequent Late Arrivals</h2>
            <p className="text-xs text-surface-400 mt-0.5">From recorded check-ins</p>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {lateArrivals.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-surface-400">No late arrivals recorded.</div>
            ) : lateArrivals.map((r, i) => (
              <div key={r.name} className="flex items-center gap-4 px-5 py-3.5">
                <span className={`text-sm font-semibold w-5 shrink-0 ${i === 0 ? 'text-danger-500' : 'text-surface-400'}`}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{r.name}</p>
                  <p className="text-xs text-surface-400">{r.dept}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-warning-600">{r.times}x</p>
                  <p className="text-xs text-surface-400">avg {r.avg_delay} late</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
