import { useEffect, useState } from 'react'
import { Search, Filter, Download, Eye, Trash2, MapPin } from 'lucide-react'
import { Button, Avatar, Pagination, Modal, ConfirmDialog, PageLoader } from '@/components/ui'
import { formatDate, formatTime, durationMinutes, getStatusConfig, downloadBlob } from '@/utils/helpers'
import { attendanceService, reportService } from '@/services/auth'
import toast from 'react-hot-toast'

export default function AttendancePage() {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewRecord, setViewRecord] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const perPage = 10

  async function loadRecords() {
    setLoading(true)
    try {
      setRecords(await attendanceService.getAll())
    } catch {
      toast.error('Unable to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.employee.name.toLowerCase().includes(q) ||
      r.employee.employee_id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await attendanceService.delete(deleteId)
      setRecords(rs => rs.filter(r => r.id !== deleteId))
      toast.success('Record deleted.')
      setDeleteId(null)
    } catch {
      toast.error('Unable to delete record.')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleExport() {
    try {
      downloadBlob(await reportService.exportCSV(), 'attendance-report.csv')
      toast.success('Report exported as CSV.')
    } catch {
      toast.error('Unable to export report.')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-sm text-surface-500 mt-0.5">{formatDate(new Date(), 'EEEE, MMMM d')} · {filtered.length} records</p>
        </div>
        <Button variant="secondary" size="md" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </Button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              className="input pl-9"
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-surface-400 shrink-0" />
            <select
              className="input w-40"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Location</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-surface-400 text-sm">No records found</td></tr>
              ) : paginated.map(record => {
                const status = getStatusConfig(record.status)
                const duration = durationMinutes(record.check_in, record.check_out)
                return (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={record.employee.name} size="sm" />
                        <div>
                          <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{record.employee.name}</p>
                          <p className="text-xs text-surface-400">{record.employee.department} · {record.employee.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{formatDate(record.date)}</td>
                    <td><span className="font-mono text-sm">{record.check_in ? formatTime(record.check_in) : <span className="text-surface-300">-</span>}</span></td>
                    <td><span className="font-mono text-sm">{record.check_out ? formatTime(record.check_out) : <span className="text-surface-300">-</span>}</span></td>
                    <td className="text-sm">{duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '-'}</td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td>
                      {record.location ? (
                        <span className="flex items-center gap-1 text-xs text-surface-500">
                          <MapPin size={12} /> {record.location}
                        </span>
                      ) : <span className="text-surface-300">-</span>}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewRecord(record)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-surface-700">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setDeleteId(record.id)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-danger-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
      </div>

      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title="Attendance Detail" size="sm">
        {viewRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-100 dark:border-surface-700">
              <Avatar name={viewRecord.employee.name} size="lg" />
              <div>
                <p className="font-semibold text-surface-900 dark:text-surface-100">{viewRecord.employee.name}</p>
                <p className="text-sm text-surface-500">{viewRecord.employee.department} · {viewRecord.employee.employee_id}</p>
              </div>
            </div>
            {[
              { label: 'Date', value: formatDate(viewRecord.date) },
              { label: 'Check In', value: viewRecord.check_in ? formatTime(viewRecord.check_in) : '-' },
              { label: 'Check Out', value: viewRecord.check_out ? formatTime(viewRecord.check_out) : 'Still checked in' },
              { label: 'Duration', value: (() => { const d = durationMinutes(viewRecord.check_in, viewRecord.check_out); return d ? `${Math.floor(d / 60)}h ${d % 60}m` : '-' })() },
              { label: 'Status', value: getStatusConfig(viewRecord.status).label },
              { label: 'Location', value: viewRecord.location || '-' },
              { label: 'Notes', value: viewRecord.notes || '-' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-surface-400">{row.label}</span>
                <span className="font-medium text-surface-700 dark:text-surface-300">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Record"
        description="This attendance record will be permanently deleted. This action cannot be undone."
      />
    </div>
  )
}
