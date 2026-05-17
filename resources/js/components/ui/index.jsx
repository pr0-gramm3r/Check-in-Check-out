import { forwardRef } from 'react'
import { cn, getAvatarColor, getInitials } from '@/utils/helpers'
import { X, Loader2 } from 'lucide-react'

// ─── Button ──────────────────────────────────────────────────
export const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
  const sizes = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' }
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
    success: 'btn-success',
  }
  return (
    <button ref={ref} className={cn(sizes[size], variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
})
Button.displayName = 'Button'

// ─── Badge ───────────────────────────────────────────────────
export function Badge({ variant = 'surface', dot, children, className }) {
  const variants = {
    success: 'badge-success', warning: 'badge-warning',
    danger: 'badge-danger', brand: 'badge-brand', surface: 'badge-surface',
  }
  const dots = {
    success: 'bg-success-500', warning: 'bg-warning-500',
    danger: 'bg-danger-500', brand: 'bg-brand-400', surface: 'bg-surface-400',
  }
  return (
    <span className={cn(variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dots[variant])} />}
      {children}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md', className }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base', xl: 'w-14 h-14 text-lg' }
  if (src) {
    return <img src={src} alt={name} className={cn('avatar object-cover', sizes[size], className)} />
  }
  return (
    <div className={cn('avatar', getAvatarColor(name), sizes[size], className)}>
      {getInitials(name)}
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, hint, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
    <input ref={ref} className={cn('input', error && 'input-error', className)} {...props} />
    {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
    {hint && !error && <p className="text-xs text-surface-400">{hint}</p>}
  </div>
))
Input.displayName = 'Input'

// ─── Select ──────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, options = [], className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
    <select ref={ref} className={cn('input', error && 'input-error', className)} {...props}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
  </div>
))
Select.displayName = 'Select'

// ─── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return <Loader2 className={cn('animate-spin text-brand-500', sizes[size], className)} />
}

// ─── Loading Page ─────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <Spinner size="xl" className="mx-auto" />
        <p className="text-sm text-surface-400">Loading...</p>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <Icon size={24} className="text-surface-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-400 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={cn('relative w-full bg-white dark:bg-surface-800 rounded-2xl shadow-modal border border-surface-200 dark:border-surface-700 animate-slide-up', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-sm p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, iconColor = 'text-brand-500', iconBg = 'bg-brand-50 dark:bg-brand-900/30', trend, className }) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{label}</p>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon size={18} className={iconColor} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-1">{value}</p>
      {sub && <p className="text-xs text-surface-400">{sub}</p>}
      {trend != null && (
        <p className={cn('text-xs font-medium mt-2', trend >= 0 ? 'text-success-600' : 'text-danger-600')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
        </p>
      )}
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }>
      <p className="text-sm text-surface-600 dark:text-surface-400">{description}</p>
    </Modal>
  )
}

// ─── Pagination ───────────────────────────────────────────────
export function Pagination({ page, total, perPage = 15, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
      <p className="text-xs text-surface-500">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost btn-sm px-3 py-1.5 rounded-lg disabled:opacity-40"
        >← Prev</button>
        <span className="px-3 py-1 text-xs font-medium text-surface-600 dark:text-surface-400">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="btn-ghost btn-sm px-3 py-1.5 rounded-lg disabled:opacity-40"
        >Next →</button>
      </div>
    </div>
  )
}
