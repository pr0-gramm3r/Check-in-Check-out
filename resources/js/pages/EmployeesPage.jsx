import { useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Mail, Filter } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Avatar, Pagination, Modal, ConfirmDialog, StatCard, PageLoader } from '@/components/ui'
import { formatDate, getStatusConfig } from '@/utils/helpers'
import { departmentService, employeeService } from '@/services/auth'
import toast from 'react-hot-toast'

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  employee_id: z.string().min(2, 'Employee ID required'),
  department: z.string().optional(),
  role: z.string().min(2, 'Role/designation required'),
  joined: z.string().min(1, 'Joining date required'),
  status: z.enum(['active', 'inactive']),
})

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const perPage = 8

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: 'active' },
  })

  async function loadData() {
    setLoading(true)
    try {
      const [employeeData, departmentData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
      ])
      setEmployees(employeeData)
      setDepartments(departmentData)
    } catch {
      toast.error('Unable to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const departmentOptions = [...new Set([
    ...departments.map(d => d.name),
    ...employees.map(e => e.department).filter(Boolean),
  ])].filter(d => d !== 'Unassigned')

  const filtered = employees.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.employee_id.toLowerCase().includes(q)
    const matchDept = deptFilter === 'all' || e.department === deptFilter
    return matchSearch && matchDept
  })

  const paginated = filtered.slice((page - 1) * perPage, page * perPage)
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    present: employees.filter(e => e.today_status === 'present' || e.today_status === 'late').length,
    absent: employees.filter(e => e.today_status === 'absent').length,
  }

  function openAdd() {
    setEditTarget(null)
    reset({ status: 'active', joined: new Date().toISOString().split('T')[0], role: 'Employee' })
    setModalOpen(true)
  }

  function openEdit(emp) {
    setEditTarget(emp)
    reset(emp)
    setModalOpen(true)
  }

  async function onSubmit(data) {
    try {
      if (editTarget) {
        const updated = await employeeService.update(editTarget.id, data)
        setEmployees(es => es.map(e => e.id === editTarget.id ? { ...updated, today_status: e.today_status } : e))
        toast.success('Employee updated.')
      } else {
        const created = await employeeService.create(data)
        setEmployees(es => [{ ...created, today_status: 'absent' }, ...es])
        toast.success('Employee added.')
      }
      setModalOpen(false)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Unable to save employee.')
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await employeeService.delete(deleteId)
      setEmployees(es => es.filter(e => e.id !== deleteId))
      toast.success('Employee removed.')
      setDeleteId(null)
    } catch {
      toast.error('Unable to remove employee.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-sm text-surface-500 mt-0.5">{employees.length} total employees</p>
        </div>
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus size={15} /> Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} iconColor="text-brand-600" iconBg="bg-brand-50 dark:bg-brand-900/30" />
        <StatCard label="Active" value={stats.active} iconColor="text-success-600" iconBg="bg-success-50 dark:bg-success-900/20" />
        <StatCard label="Present" value={stats.present} iconColor="text-success-600" iconBg="bg-success-50 dark:bg-success-900/20" />
        <StatCard label="Absent" value={stats.absent} iconColor="text-danger-600" iconBg="bg-danger-50 dark:bg-danger-900/20" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="input pl-9" placeholder="Search by name, email or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-surface-400 shrink-0" />
          <select className="input w-44" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
            <option value="all">All Departments</option>
            {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Today</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-14 text-center text-surface-400 text-sm">No employees found</td></tr>
              ) : paginated.map(emp => {
                const todayCfg = getStatusConfig(emp.today_status)
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} size="sm" />
                        <div>
                          <p className="font-medium text-surface-800 dark:text-surface-200 text-sm">{emp.name}</p>
                          <p className="text-xs text-surface-400">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{emp.department}</td>
                    <td className="text-sm text-surface-500">{emp.role}</td>
                    <td className="text-sm">{formatDate(emp.joined)}</td>
                    <td>
                      <span className={`badge ${todayCfg.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${todayCfg.dot}`} />
                        {todayCfg.label}
                      </span>
                    </td>
                    <td>
                      <span className={emp.status === 'active' ? 'badge-success badge' : 'badge-surface badge'}>
                        {emp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <a href={`mailto:${emp.email}`} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-brand-600">
                          <Mail size={15} />
                        </a>
                        <button onClick={() => openEdit(emp)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-brand-600">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => setDeleteId(emp.id)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-danger-600">
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Employee' : 'Add Employee'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              {editTarget ? 'Save Changes' : 'Add Employee'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Full name</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Full name" {...register('name')} />
              {errors.name && <p className="text-xs text-danger-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
              <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="work@company.com" {...register('email')} />
              {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Phone</label>
              <input className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210" {...register('phone')} />
              {errors.phone && <p className="text-xs text-danger-600">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Employee ID</label>
              <input className={`input ${errors.employee_id ? 'input-error' : ''}`} placeholder="EMP1001" {...register('employee_id')} />
              {errors.employee_id && <p className="text-xs text-danger-600">{errors.employee_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
              <input className={`input ${errors.department ? 'input-error' : ''}`} list="department-options" placeholder="Department" {...register('department')} />
              <datalist id="department-options">
                {departmentOptions.map(d => <option key={d} value={d} />)}
              </datalist>
              {errors.department && <p className="text-xs text-danger-600">{errors.department.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Role / Designation</label>
              <input className={`input ${errors.role ? 'input-error' : ''}`} placeholder="e.g. Senior Developer" {...register('role')} />
              {errors.role && <p className="text-xs text-danger-600">{errors.role.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Joining Date</label>
              <input type="date" className={`input ${errors.joined ? 'input-error' : ''}`} {...register('joined')} />
              {errors.joined && <p className="text-xs text-danger-600">{errors.joined.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
              <select className="input" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Employee"
        description="This employee and all their associated attendance records will be permanently deleted."
      />
    </div>
  )
}
