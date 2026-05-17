import api from './api'

// ─── Auth ────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),
}

// ─── Dashboard ───────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats').then(r => r.data),
  getRecentActivity: (params) => api.get('/dashboard/activity', { params }).then(r => r.data),
  getLiveStatus: () => api.get('/dashboard/live').then(r => r.data),
  getWeeklyChart: () => api.get('/dashboard/weekly-chart').then(r => r.data),
}

// ─── Attendance ───────────────────────────────────────────────
export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data).then(r => r.data),
  checkOut: (data) => api.post('/attendance/check-out', data).then(r => r.data),
  getToday: () => api.get('/attendance/today').then(r => r.data),
  getAll: (params) => api.get('/attendance', { params }).then(r => r.data),
  getById: (id) => api.get(`/attendance/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/attendance/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/attendance/${id}`).then(r => r.data),
  getMyAttendance: (params) => api.get('/attendance/my', { params }).then(r => r.data),
}

// ─── Employees ───────────────────────────────────────────────
export const employeeService = {
  getAll: (params) => api.get('/employees', { params }).then(r => r.data),
  getById: (id) => api.get(`/employees/${id}`).then(r => r.data),
  create: (data) => api.post('/employees', data).then(r => r.data),
  update: (id, data) => api.put(`/employees/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/employees/${id}`).then(r => r.data),
  getAttendance: (id, params) => api.get(`/employees/${id}/attendance`, { params }).then(r => r.data),
}

// ─── Departments ─────────────────────────────────────────────
export const departmentService = {
  getAll: () => api.get('/departments').then(r => r.data),
  create: (data) => api.post('/departments', data).then(r => r.data),
  update: (id, data) => api.put(`/departments/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/departments/${id}`).then(r => r.data),
}

// ─── Reports ─────────────────────────────────────────────────
export const reportService = {
  getDashboard: () => api.get('/reports/dashboard').then(r => r.data),
  getAttendanceSummary: (params) => api.get('/reports/attendance-summary', { params }).then(r => r.data),
  getLateArrivals: (params) => api.get('/reports/late-arrivals', { params }).then(r => r.data),
  getAbsentees: (params) => api.get('/reports/absentees', { params }).then(r => r.data),
  getOvertime: (params) => api.get('/reports/overtime', { params }).then(r => r.data),
  exportCSV: (params) => api.get('/reports/export', { params, responseType: 'blob' }).then(r => r.data),
}

// ─── Profile ─────────────────────────────────────────────────
export const profileService = {
  update: (data) => api.put('/profile', data).then(r => r.data),
  changePassword: (data) => api.put('/profile/password', data).then(r => r.data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('avatar', file)
    return api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
  },
}

// ─── Settings ────────────────────────────────────────────────
export const settingsService = {
  get: () => api.get('/settings').then(r => r.data),
  update: (data) => api.put('/settings', data).then(r => r.data),
  getShifts: () => api.get('/settings/shifts').then(r => r.data),
  createShift: (data) => api.post('/settings/shifts', data).then(r => r.data),
  updateShift: (id, data) => api.put(`/settings/shifts/${id}`, data).then(r => r.data),
  deleteShift: (id) => api.delete(`/settings/shifts/${id}`).then(r => r.data),
}
