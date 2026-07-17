import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'
import StudentDashboard from './pages/StudentDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'

function AppRoutes() {
  const { token, role } = useAuth()

  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={token ? <Navigate to={`/${role?.toLowerCase() || ''}`} /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyOTP />} />

        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['DRIVER']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={token ? `/${role?.toLowerCase() || 'login'}` : '/login'} />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastProvider />
      </AuthProvider>
    </BrowserRouter>
  )
}
