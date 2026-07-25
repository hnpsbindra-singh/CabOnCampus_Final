import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('rememberedUsername')
    if (saved) {
      setForm(f => ({ ...f, username: saved }))
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const token = res.data
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

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

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', form.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      login(token, userData)
      showToast('Welcome back.', 'success')
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
      <div className="auth-card fade-up">
        <div style={{ marginBottom: '16px' }}>
          <h1 className="auth-title" style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>ThaparOnWheelz</h1>
          <p className="auth-subtitle" style={{ margin: '2px 0 0 0' }}>Campus Rickshaw Booking Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your email or username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 700 }}>
              Forgot password?
            </Link>
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? <span className="loader" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>Register here</Link>
        </div>
      </div>
    </div>
  )
}
