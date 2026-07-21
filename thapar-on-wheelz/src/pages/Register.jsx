import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Zap, Eye, EyeOff, Lock, Shield, Key } from 'lucide-react'

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
    if (score === 2 || score === 3) return { score, label: 'Medium', color: '#d97706' }
    return { score, label: 'Strong', color: '#059669' }
  }

  const strength = getPasswordStrength(form.password)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // validate email
    if (!form.username.endsWith('@thapar.edu')) {
      return showToast('Email must be a valid @thapar.edu email address', 'error')
    }

    // validate phone
    if (!/^\d{10}$/.test(form.phoneNumber)) {
      return showToast('Phone number must contain exactly 10 digits', 'error')
    }

    // validate password length
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
      {/* Decorative Floating Symbols */}
      <div className="auth-symbol one"><Lock size={26} /></div>
      <div className="auth-symbol two"><Shield size={24} /></div>
      <div className="auth-symbol three"><Key size={26} /></div>

      <div className="auth-bg-glow one" />
      <div className="auth-bg-glow two" />
      <div className="auth-card animate-scale" style={{ maxWidth: 500 }}>
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={28} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>Create Account</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Join ThaparOnWheelz campus ride network as a Student</p>
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
          border: '1px solid rgba(140, 6, 35, 0.15)',
          width: '100%',
          justifyContent: 'center'
        }}>
          Driver and Admin accounts must be created by the system administrator.
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input"
              placeholder="Arjun Singh" 
              value={form.name} 
              onChange={e => set('name', e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input"
              placeholder="98765XXXXX" 
              value={form.phoneNumber} 
              onChange={e => set('phoneNumber', e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="you@thapar.edu" 
              value={form.username} 
              onChange={e => set('username', e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '44px' }}
                placeholder="8-15 characters" 
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
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Password Strength</span>
                  <span style={{ fontSize: '10px', color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '3px' }}>
                  <div style={{ flex: 1, background: strength.score >= 1 ? strength.color : 'var(--border)', borderRadius: '2px', transition: 'var(--transition)' }} />
                  <div style={{ flex: 1, background: strength.score >= 2 ? strength.color : 'var(--border)', borderRadius: '2px', transition: 'var(--transition)' }} />
                  <div style={{ flex: 1, background: strength.score >= 4 ? strength.color : 'var(--border)', borderRadius: '2px', transition: 'var(--transition)' }} />
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
            {loading ? <span className="loader" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
