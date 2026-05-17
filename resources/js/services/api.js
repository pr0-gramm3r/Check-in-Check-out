import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 15000,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content
    if (csrf) {
      config.headers['X-CSRF-TOKEN'] = csrf
    }

    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      const isAuthProbe = error.config?.url === '/auth/me'
      const isGuestPage = ['/login', '/signup', '/register'].includes(window.location.pathname)
      if (!isAuthProbe && !isGuestPage) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 422) {
      // Validation errors handled per-form
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (message) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
