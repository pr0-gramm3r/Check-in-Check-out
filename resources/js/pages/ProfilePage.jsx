import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Lock, User, Mail, Phone, Briefcase, Building2, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar, Button, Badge, PageLoader } from '@/components/ui'
import { formatDate, formatTime, durationMinutes, getStatusConfig } from '@/utils/helpers'
import { attendanceService, profileService } from '@/services/auth'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name:     z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  phone:    z.string().optional(),
  role:     z.string().optional(),
})

const passwordSchema = z.object({
  current_password:      z.string().min(6, 'Enter current password'),
  password:              z.string().min(8, 'Min. 8 characters'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [attendance, setAttendance] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  const { register: rP, handleSubmit: hP, formState: { errors: eP, isSubmitting: sP } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:  user?.name  || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role:  user?.role  || '',
    },
  })

  const { register: rPw, handleSubmit: hPw, reset: resetPw, formState: { errors: ePw, isSubmitting: sPw } } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  async function onProfileSave(data) {
    try {
      const updated = await profileService.update(data)
      updateUser(updated)
      toast.success('Profile updated.')
    } catch {
      toast.error('Unable to update profile.')
    }
  }

  async function onPasswordSave(data) {
    try {
      await profileService.changePassword(data)
      resetPw()
      toast.success('Password changed successfully.')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Unable to change password.')
    }
  }

  useEffect(() => {
    if (activeTab !== 'activity') return

    async function loadAttendance() {
      setAttendanceLoading(true)
      try {
        setAttendance(await attendanceService.getMyAttendance())
      } catch {
        toast.error('Unable to load attendance.')
      } finally {
        setAttendanceLoading(false)
      }
    }

    loadAttendance()
  }, [activeTab])

  const completed = attendance.filter(r => r.check_in && r.check_out)
  const avgMinutes = completed.length
    ? Math.round(completed.reduce((sum, r) => sum + durationMinutes(r.check_in, r.check_out), 0) / completed.length)
    : 0
  const summary = [
    { label: 'Present Days', value: attendance.filter(r => r.status === 'present').length },
    { label: 'Absent Days', value: 0 },
    { label: 'Late Arrivals', value: attendance.filter(r => r.status === 'late').length },
    { label: 'On Leave', value: 0 },
    { label: 'Avg Check-in', value: attendance[0]?.check_in ? formatTime(attendance[0].check_in) : '-' },
    { label: 'Avg Hours/Day', value: avgMinutes ? `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m` : '-' },
  ]

  const tabs = [
    { id: 'profile',  label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'activity', label: 'My Attendance' },
  ]

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">Profile</h1>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with upload */}
          <div className="relative shrink-0">
            <Avatar name={user?.name} src={user?.avatar} size="xl" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center shadow-md hover:bg-brand-700 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{user?.name || 'Your Name'}</h2>
            <p className="text-sm text-surface-500">{user?.role || 'Employee'} · {user?.department || 'Department'}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="success" dot>Active</Badge>
              <span className="text-xs text-surface-400">Joined {formatDate(user?.joined || new Date())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-5">Personal information</h3>
          <form onSubmit={hP(onProfileSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Full name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input className={`input pl-9 ${eP.name ? 'input-error' : ''}`} {...rP('name')} />
                </div>
                {eP.name && <p className="text-xs text-danger-600">{eP.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="email" className={`input pl-9 ${eP.email ? 'input-error' : ''}`} {...rP('email')} />
                </div>
                {eP.email && <p className="text-xs text-danger-600">{eP.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Phone number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input className="input pl-9" placeholder="+91 98765 43210" {...rP('phone')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Role / Designation</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input className="input pl-9" placeholder="e.g. Senior Developer" {...rP('role')} />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" loading={sP}>
                <Save size={14} /> Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Password tab */}
      {activeTab === 'password' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-5">Change password</h3>
          <form onSubmit={hPw(onPasswordSave)} className="space-y-4 max-w-sm">
            {[
              { name: 'current_password',      label: 'Current password',  err: ePw.current_password },
              { name: 'password',              label: 'New password',       err: ePw.password, hint: 'Min. 8 characters' },
              { name: 'password_confirmation', label: 'Confirm new password', err: ePw.password_confirmation },
            ].map(f => (
              <div key={f.name} className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{f.label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="password" className={`input pl-9 ${f.err ? 'input-error' : ''}`} placeholder="••••••••" {...rPw(f.name)} />
                </div>
                {f.err && <p className="text-xs text-danger-600">{f.err.message}</p>}
                {f.hint && !f.err && <p className="text-xs text-surface-400">{f.hint}</p>}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" loading={sPw}>
                <Lock size={14} /> Update Password
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Attendance summary tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4 animate-fade-in">
          {attendanceLoading ? <PageLoader /> : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {summary.map(s => (
                  <div key={s.label} className="card p-4">
                    <p className="text-xs text-surface-400 mb-1">{s.label}</p>
                    <p className="text-xl font-semibold text-surface-900 dark:text-surface-100">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-700">
                  <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">Recent Attendance</h3>
                </div>
                <table className="table">
                  <thead>
                    <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-sm text-surface-400">No attendance records yet.</td></tr>
                    ) : attendance.slice(0, 5).map(record => {
                      const minutes = durationMinutes(record.check_in, record.check_out)
                      const status = getStatusConfig(record.status)
                      return (
                        <tr key={record.id}>
                          <td>{formatDate(record.date)}</td>
                          <td className="font-mono text-sm">{formatTime(record.check_in)}</td>
                          <td className="font-mono text-sm">{record.check_out ? formatTime(record.check_out) : '-'}</td>
                          <td className="text-sm">{minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : '-'}</td>
                          <td><span className={`badge ${status.class}`}><span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
