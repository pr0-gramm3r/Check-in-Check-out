import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ClipboardList, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui'
import { Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
})

export default function LoginPage() {
  const { login } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  })

  async function onSubmit(data) {
    try {
      await login(data)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[46%] bg-brand-600 relative overflow-hidden flex-col justify-between p-12">
        {/* Decoration */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-24 h-24 rounded-2xl bg-white/5 rotate-12" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">AttendIQ</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-semibold text-white leading-tight mb-4">
            Track attendance,<br />effortlessly.
          </h1>
          <p className="text-brand-200 text-base leading-relaxed max-w-sm">
            One platform for employee check-ins, time tracking, reporting, and team insights.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<1s', label: 'Check-in time' },
              { value: 'Real-time', label: 'Reporting' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-semibold text-lg">{s.value}</p>
                <p className="text-brand-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-300 text-xs relative z-10">© {new Date().getFullYear()} AttendIQ. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-12 pt-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <ClipboardList size={15} className="text-white" />
            </div>
            <span className="font-semibold text-surface-900 dark:text-surface-100">AttendIQ</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost p-2 rounded-lg text-surface-500">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <span className="text-sm text-surface-500">No account?</span>
            <Link to="/signup" className="text-sm font-medium text-brand-600 hover:text-brand-700">Sign up →</Link>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-8">
          <div className="w-full max-w-sm animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-100 mb-1">Sign in</h2>
              <p className="text-sm text-surface-500">Access your attendance dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-danger-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger-600">{errors.password.message}</p>}
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" {...register('remember')} />
                <span className="text-sm text-surface-600 dark:text-surface-400">Remember me for 30 days</span>
              </label>

              <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
                {!isSubmitting && <ArrowRight size={16} />}
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
