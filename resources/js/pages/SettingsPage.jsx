import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Clock, Bell, Sliders, Plus, Edit2, Trash2, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button, Modal, ConfirmDialog, PageLoader } from '@/components/ui'
import { settingsService } from '@/services/auth'
import toast from 'react-hot-toast'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const NOTIFICATION_SETTINGS = [
  { key: 'late_alert', label: 'Late arrival alerts', desc: 'Notify managers when an employee is late', default: true },
  { key: 'absent_alert', label: 'Absent alerts', desc: 'Daily notification for unchecked employees', default: true },
  { key: 'checkout_reminder', label: 'Check-out reminders', desc: 'Remind employees to check out before shift end', default: false },
  { key: 'daily_report', label: 'Daily summary email', desc: 'Send attendance summary to admin at end of day', default: true },
  { key: 'weekly_report', label: 'Weekly report', desc: 'Weekly analytics report every Monday morning', default: false },
]

const normalizeShift = (shift) => ({
  ...shift,
  start: shift.start?.slice(0, 5),
  end: shift.end?.slice(0, 5),
})

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shifts')
  const [shifts, setShifts] = useState([])
  const [shiftModal, setShiftModal] = useState(false)
  const [editShift, setEditShift] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggles, setToggles] = useState(Object.fromEntries(NOTIFICATION_SETTINGS.map(n => [n.key, n.default])))

  const { register: rS, handleSubmit: hS, reset: resetS, formState: { errors: eS, isSubmitting: sS } } = useForm()
  const { register: rG, handleSubmit: hG, reset: resetG, formState: { isSubmitting: sG } } = useForm()

  async function loadSettings() {
    setLoading(true)
    try {
      const [settings, shiftData] = await Promise.all([
        settingsService.get(),
        settingsService.getShifts(),
      ])
      setShifts(shiftData.map(normalizeShift))
      setToggles(t => ({ ...t, ...(settings.notifications || {}) }))
      resetG({
        company_name: settings.company_name,
        timezone: settings.timezone,
        work_hours: settings.work_hours,
        overtime_threshold: settings.overtime_threshold,
      })
    } catch {
      toast.error('Unable to load settings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  function openAddShift() {
    setEditShift(null)
    setSelectedDays([])
    resetS({ name: '', start: '09:00', end: '18:00', grace_minutes: 15 })
    setShiftModal(true)
  }

  function openEditShift(s) {
    setEditShift(s)
    setSelectedDays(s.days || [])
    resetS(s)
    setShiftModal(true)
  }

  async function onShiftSubmit(data) {
    if (selectedDays.length === 0) { toast.error('Select at least one working day.'); return }
    const payload = { ...data, days: selectedDays, grace_minutes: Number(data.grace_minutes) }
    try {
      if (editShift) {
        const updated = normalizeShift(await settingsService.updateShift(editShift.id, payload))
        setShifts(ss => ss.map(s => s.id === editShift.id ? updated : s))
        toast.success('Shift updated.')
      } else {
        const created = normalizeShift(await settingsService.createShift(payload))
        setShifts(ss => [...ss, created])
        toast.success('Shift created.')
      }
      setShiftModal(false)
    } catch {
      toast.error('Unable to save shift.')
    }
  }

  async function handleDeleteShift() {
    setDeleteLoading(true)
    try {
      await settingsService.deleteShift(deleteId)
      setShifts(ss => ss.filter(s => s.id !== deleteId))
      toast.success('Shift deleted.')
      setDeleteId(null)
    } catch {
      toast.error('Unable to delete shift.')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function onGeneralSave(data) {
    try {
      await settingsService.update({ ...data, notifications: toggles })
      toast.success('Settings saved.')
    } catch {
      toast.error('Unable to save settings.')
    }
  }

  function toggleDay(day) {
    setSelectedDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day])
  }

  function toggleNotif(key) {
    setToggles(t => ({ ...t, [key]: !t[key] }))
  }

  const tabs = [
    { id: 'shifts', label: 'Shifts', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Sliders },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <h1 className="page-title">Settings</h1>

      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'shifts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-500">{shifts.length} shifts configured</p>
            <Button variant="primary" size="sm" onClick={openAddShift}>
              <Plus size={14} /> Add Shift
            </Button>
          </div>
          <div className="space-y-3">
            {shifts.length === 0 ? (
              <div className="card p-8 text-center text-sm text-surface-400">No shifts configured yet.</div>
            ) : shifts.map(shift => (
              <div key={shift.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={17} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-800 dark:text-surface-200 text-sm">{shift.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {shift.start} - {shift.end} · {shift.grace_minutes}min grace · {(shift.days || []).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button onClick={() => openEditShift(shift)} className="btn-ghost p-2 rounded-lg text-surface-400 hover:text-brand-600">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(shift.id)} className="btn-ghost p-2 rounded-lg text-surface-400 hover:text-danger-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card divide-y divide-surface-100 dark:divide-surface-700 overflow-hidden animate-fade-in">
          {NOTIFICATION_SETTINGS.map(n => (
            <div key={n.key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{n.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{n.desc}</p>
              </div>
              <button onClick={() => toggleNotif(n.key)} className="shrink-0 ml-4">
                {toggles[n.key]
                  ? <ToggleRight size={28} className="text-brand-600" />
                  : <ToggleLeft size={28} className="text-surface-300 dark:text-surface-600" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'general' && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-5">Company & system settings</h3>
          <form onSubmit={hG(onGeneralSave)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Company name</label>
                <input className="input" {...rG('company_name')} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Timezone</label>
                <select className="input" {...rG('timezone')}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Standard work hours / day</label>
                <input type="number" className="input" min={1} max={24} {...rG('work_hours')} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Overtime threshold (hours)</label>
                <input type="number" className="input" min={1} max={24} {...rG('overtime_threshold')} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" loading={sG}>
                <Save size={14} /> Save Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      <Modal
        open={shiftModal}
        onClose={() => setShiftModal(false)}
        title={editShift ? 'Edit Shift' : 'New Shift'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShiftModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={hS(onShiftSubmit)} loading={sS}>
              {editShift ? 'Save Changes' : 'Create Shift'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Shift name</label>
            <input className={`input ${eS.name ? 'input-error' : ''}`} placeholder="e.g. Morning Shift" {...rS('name', { required: 'Name required' })} />
            {eS.name && <p className="text-xs text-danger-600">{eS.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Start time</label>
              <input type="time" className="input" {...rS('start', { required: true })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">End time</label>
              <input type="time" className="input" {...rS('end', { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Grace period (minutes)</label>
            <input type="number" className="input" min={0} max={60} defaultValue={15} {...rS('grace_minutes')} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Working days</label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedDays.includes(day)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-600 hover:border-brand-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteShift}
        loading={deleteLoading}
        title="Delete Shift"
        description="This shift will be permanently deleted."
      />
    </div>
  )
}
