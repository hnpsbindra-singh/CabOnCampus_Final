import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    
    if (score <= 1) return { score, label: 'Weak', color: 'var(--danger)' }
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'var(--warning)' }
    return { score, label: 'Strong', color: 'var(--success)' }
  }

  const strength = getPasswordStrength(form.password)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!form.username.endsWith('@thapar.edu')) {
      return showToast('Registration requires a valid @thapar.edu email address', 'error')
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      return showToast('Phone number must contain exactly 10 digits', 'error')
    }

    if (form.password.length < 8 || form.password.length > 15) {
      return showToast('Password must be between 8 and 15 characters', 'error')
    }

    setLoading(true)
    try {
      await api.post('/auth/register', form)
      showToast('Registered! Verify your OTP now.', 'success')
      navigate('/verify?username=' + encodeURIComponent(form.username))
    } catch (err) {
      showToast(err.response?.data || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-up">
        <div style={{ marginBottom: '16px' }}>
          <h1 className="auth-title" style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>Create Account</h1>
          <p className="auth-subtitle" style={{ margin: '2px 0 0 0' }}>Join ThaparOnWheelz Campus Shuttle</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (@thapar.edu)</label>
            <input
              type="email"
              className="form-input"
              placeholder="yourname@thapar.edu"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (10 digits)</label>
            <input
              type="text"
              className="form-input"
              placeholder="10 digit mobile number"
              value={form.phoneNumber}
              onChange={e => set('phoneNumber', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (8-15 chars)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => set('password', e.target.value)}
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
            {form.password && (
              <div style={{ fontSize: '11px', color: strength.color, fontWeight: 700, marginTop: '2px' }}>
                Password Strength: {strength.label}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <span className="loader" /> : 'Register Student Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
