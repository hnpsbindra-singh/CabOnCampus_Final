import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { WifiOff } from 'lucide-react'

import Landing from './pages/Landing'
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
        <Route path="/" element={<Landing />} />
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

        <Route path="*" element={<Navigate to={token ? `/${role?.toLowerCase() || ''}` : '/'} />} />
      </Routes>
    </>
  )
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }
    function handleOffline() {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastProvider />
        {isOffline && (
          <div 
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '24px',
              zIndex: 99999,
              background: '#1e293b',
              color: '#ffffff',
              borderRadius: '100px',
              padding: '10px 18px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.08)',
              animation: 'fadeUp 0.3s ease'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
            <WifiOff size={14} style={{ color: '#94a3b8' }} />
            <span>Offline Mode: showing cached data</span>
          </div>
        )}
      </AuthProvider>
    </BrowserRouter>
  )
}
