import { clsx } from 'clsx'
import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'

// Class name utility
export function cn(...args) {
  return clsx(args)
}

// Date formatters
export const formatDate = (date, fmt = 'MMM d, yyyy') =>
  date ? format(typeof date === 'string' ? parseISO(date) : date, fmt) : '—'

export const formatTime = (date) =>
  date ? format(typeof date === 'string' ? parseISO(date) : date, 'h:mm a') : '—'

export const formatDateTime = (date) =>
  date ? format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy · h:mm a') : '—'

export const timeAgo = (date) =>
  date ? formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true }) : '—'

export const durationMinutes = (start, end) => {
  if (!start || !end) return null
  return differenceInMinutes(
    typeof end === 'string' ? parseISO(end) : end,
    typeof start === 'string' ? parseISO(start) : start
  )
}

export const formatDuration = (minutes) => {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Avatar color from name
const avatarColors = [
  'bg-brand-500', 'bg-success-500', 'bg-warning-500',
  'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
]

export function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Status helpers
export function getStatusConfig(status) {
  const map = {
    present:   { label: 'Present',    class: 'badge-success', dot: 'bg-success-500' },
    absent:    { label: 'Absent',     class: 'badge-danger',  dot: 'bg-danger-500' },
    late:      { label: 'Late',       class: 'badge-warning', dot: 'bg-warning-500' },
    on_leave:  { label: 'On Leave',   class: 'badge-brand',   dot: 'bg-brand-400' },
    checked_out: { label: 'Checked Out', class: 'badge-surface', dot: 'bg-surface-400' },
    remote:    { label: 'Remote',     class: 'badge-brand',   dot: 'bg-brand-400' },
  }
  return map[status] || { label: status, class: 'badge-surface', dot: 'bg-surface-400' }
}

// Download blob
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Pagination helper
export function getPaginationRange(current, total, delta = 2) {
  const range = []
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    range.push(i)
  }
  if (range[0] > 1) { range.unshift('...'); range.unshift(1) }
  if (range[range.length - 1] < total) { range.push('...'); range.push(total) }
  return range
}
