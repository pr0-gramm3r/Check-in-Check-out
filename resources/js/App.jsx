import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import AttendancePage from '@/pages/AttendancePage'
import EmployeesPage from '@/pages/EmployeesPage'
import DepartmentsPage from '@/pages/DepartmentsPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import ProfilePage from '@/pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest routes */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"   element={<DashboardPage />} />
              <Route path="attendance"  element={<AdminRoute><AttendancePage /></AdminRoute>} />
              <Route path="employees"   element={<AdminRoute><EmployeesPage /></AdminRoute>} />
              <Route path="departments" element={<AdminRoute><DepartmentsPage /></AdminRoute>} />
              <Route path="reports"     element={<AdminRoute><ReportsPage /></AdminRoute>} />
              <Route path="settings"    element={<AdminRoute><SettingsPage /></AdminRoute>} />
              <Route path="profile"     element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              padding: '10px 14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
