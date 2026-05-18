import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = !!user?.is_admin

  useEffect(() => {
    let active = true

    async function loadUser() {
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser))
          setLoading(false)
          return
        } catch {}
      }

      try {
        const data = await authService.me()
        if (!active) return
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        setUser(data.user)
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUser()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('auth_user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
