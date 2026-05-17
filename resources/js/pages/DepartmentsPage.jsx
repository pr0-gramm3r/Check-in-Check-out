import { useEffect, useState } from 'react'
import { Building2, Plus, Edit2, Trash2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Modal, ConfirmDialog, PageLoader } from '@/components/ui'
import { departmentService } from '@/services/auth'
import toast from 'react-hot-toast'

const DEPT_COLORS = [
  { label: 'Indigo', value: 'bg-brand-500', text: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Green', value: 'bg-success-500', text: 'text-success-600', bg: 'bg-success-50' },
  { label: 'Amber', value: 'bg-warning-500', text: 'text-warning-600', bg: 'bg-warning-50' },
  { label: 'Red', value: 'bg-danger-500', text: 'text-danger-600', bg: 'bg-danger-50' },
  { label: 'Purple', value: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Teal', value: 'bg-teal-500', text: 'text-teal-600', bg: 'bg-teal-50' },
]

const schema = z.object({
  name: z.string().min(2, 'Department name required'),
  head: z.string().optional(),
  description: z.string().optional(),
  color: z.number().default(0),
})

export default function DepartmentsPage() {
  const [depts, setDepts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function loadDepartments() {
    setLoading(true)
    try {
      setDepts(await departmentService.getAll())
    } catch {
      toast.error('Unable to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  function openAdd() {
    setEditTarget(null)
    setSelectedColor(0)
    reset({ name: '', head: '', description: '', color: 0 })
    setModalOpen(true)
  }

  function openEdit(dept) {
    setEditTarget(dept)
    setSelectedColor(dept.color)
    reset({ ...dept })
    setModalOpen(true)
  }

  async function onSubmit(data) {
    const payload = { ...data, color: selectedColor }
    try {
      if (editTarget) {
        const updated = await departmentService.update(editTarget.id, payload)
        setDepts(ds => ds.map(d => d.id === editTarget.id ? updated : d))
        toast.success('Department updated.')
      } else {
        const created = await departmentService.create(payload)
        setDepts(ds => [...ds, created])
        toast.success('Department created.')
      }
      setModalOpen(false)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Unable to save department.')
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await departmentService.delete(deleteId)
      setDepts(ds => ds.filter(d => d.id !== deleteId))
      toast.success('Department deleted.')
      setDeleteId(null)
    } catch {
      toast.error('Unable to delete department.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-5 md:p-7 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-sm text-surface-500 mt-0.5">{depts.length} departments · {depts.reduce((a, d) => a + d.employee_count, 0)} employees</p>
        </div>
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus size={15} /> New Department
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map(dept => {
          const col = DEPT_COLORS[dept.color] || DEPT_COLORS[0]
          return (
            <div key={dept.id} className="card p-5 group hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${col.bg} flex items-center justify-center`}>
                  <Building2 size={18} className={col.text} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-brand-600">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(dept.id)} className="btn-ghost p-1.5 rounded-lg text-surface-400 hover:text-danger-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">{dept.name}</h3>
              {dept.description && (
                <p className="text-xs text-surface-400 mb-3 leading-relaxed line-clamp-2">{dept.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-700 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-surface-500">
                  <Users size={13} />
                  <span>{dept.employee_count} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full ${col.value} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{(dept.head || dept.name)[0]}</span>
                  </div>
                  <span className="text-xs text-surface-500">{dept.head || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          )
        })}

        <button
          onClick={openAdd}
          className="card p-5 border-dashed border-2 border-surface-300 dark:border-surface-600 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[160px] group"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-surface-400 group-hover:text-brand-600" />
          </div>
          <p className="text-sm font-medium text-surface-400 group-hover:text-brand-600 transition-colors">Add department</p>
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Department' : 'New Department'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              {editTarget ? 'Save Changes' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department name</label>
            <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Engineering" {...register('name')} />
            {errors.name && <p className="text-xs text-danger-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department head</label>
            <input className={`input ${errors.head ? 'input-error' : ''}`} placeholder="Full name" {...register('head')} />
            {errors.head && <p className="text-xs text-danger-600">{errors.head.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Description <span className="text-surface-400 font-normal">(optional)</span></label>
            <textarea className="input resize-none h-20" placeholder="Brief description..." {...register('description')} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Color</label>
            <div className="flex items-center gap-2">
              {DEPT_COLORS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(i)}
                  className={`w-7 h-7 rounded-full ${c.value} transition-transform ${selectedColor === i ? 'ring-2 ring-offset-2 ring-surface-400 scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Department"
        description="This department will be permanently deleted. Employees will be moved to Unassigned."
      />
    </div>
  )
}
