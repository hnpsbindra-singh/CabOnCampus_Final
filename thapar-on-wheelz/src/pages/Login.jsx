import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Zap } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const token = res.data
      
      // Temporary token assignment for the profile fetch calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Decode role from JWT safely
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const pad = base64.length % 4
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)
      const role = payload.role?.replace('ROLE_', '')
      
      let userData = { username: form.username, name: form.username, role }
      try {
        if (role === 'STUDENT') {
          const profileRes = await api.get('/student/me')
          userData = { ...userData, ...profileRes.data }
        } else if (role === 'DRIVER') {
          const profileRes = await api.get('/driver/me')
          userData = { ...userData, ...profileRes.data }
        }
      } catch (profileErr) {
        console.error('Error fetching profile:', profileErr)
      }

      login(token, userData)
      showToast('Welcome back! 🚘', 'success')
      if (role === 'STUDENT') navigate('/student')
      else if (role === 'DRIVER') navigate('/driver')
      else if (role === 'ADMIN') navigate('/admin')
      else navigate('/')
    } catch (err) {
      showToast(err.response?.data || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-glow one" />
      <div className="auth-bg-glow two" />
      <div className="auth-card animate-scale">
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={28} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>ThaparOnWheelz</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Campus e-rickshaw booking</p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(140, 6, 35, 0.06)',
          color: 'var(--primary)',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 24,
          border: '1px solid rgba(140, 6, 35, 0.15)'
        }}>
          ⚡ Flat ₹10 per ride · Thapar University
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="you@thapar.edu"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? <span className="loader" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>Register here</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
          Forgot password? <Link to="/verify?reset=true" style={{ fontWeight: 700, color: 'var(--primary)' }}>Verify OTP</Link>
        </div>
      </div>
    </div>
  )
}
