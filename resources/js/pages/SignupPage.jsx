import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ClipboardList, ArrowRight, User, Mail, Lock, Briefcase } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui'
import { Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  employee_id: z.string().min(3, 'Employee ID is required'),
  department: z.string().min(1, 'Please select a department'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

const DEPARTMENTS = [
  'Engineering', 'Sales', 'Human Resources', 'Finance',
  'Design', 'Marketing', 'Operations', 'Customer Support',
]

export default function SignupPage() {
  const { login } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    try {
      // POST /api/auth/register
      const { authService } = await import('@/services/auth')
      const res = await authService.register(data)
      localStorage.setItem('auth_token', res.token)
      localStorage.setItem('auth_user', JSON.stringify(res.user))
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(m => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <ClipboardList size={15} className="text-white" />
          </div>
          <span className="font-semibold text-surface-900 dark:text-surface-100">AttendIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="btn-ghost p-2 rounded-lg text-surface-500">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <span className="text-sm text-surface-500">Have an account?</span>
          <Link to="/login" className="text-sm font-medium text-brand-600 hover:text-brand-700">Sign in →</Link>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-1">Create your account</h2>
            <p className="text-sm text-surface-500">Get started with AttendIQ in seconds</p>
          </div>

          <div className="card p-6 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input className={`input pl-9 ${errors.name ? 'input-error' : ''}`} placeholder="Ayush Kumar" {...register('name')} />
                </div>
                {errors.name && <p className="text-xs text-danger-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Work email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="email" className={`input pl-9 ${errors.email ? 'input-error' : ''}`} placeholder="ayush@company.com" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
              </div>

              {/* Employee ID + Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Employee ID</label>
                  <input className={`input ${errors.employee_id ? 'input-error' : ''}`} placeholder="EMP1001" {...register('employee_id')} />
                  {errors.employee_id && <p className="text-xs text-danger-600">{errors.employee_id.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Department</label>
                  <select className={`input ${errors.department ? 'input-error' : ''}`} {...register('department')}>
                    <option value="">Select…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-xs text-danger-600">{errors.department.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Min. 8 characters"
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger-600">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="password"
                    className={`input pl-9 ${errors.password_confirmation ? 'input-error' : ''}`}
                    placeholder="Repeat password"
                    {...register('password_confirmation')}
                  />
                </div>
                {errors.password_confirmation && <p className="text-xs text-danger-600">{errors.password_confirmation.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
                {!isSubmitting && <ArrowRight size={16} />}
                Create account
              </Button>
            </form>

            <p className="text-center text-xs text-surface-400 pt-1">
              By signing up you agree to our{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
