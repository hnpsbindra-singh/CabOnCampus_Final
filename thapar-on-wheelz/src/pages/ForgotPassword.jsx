import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Eye, EyeOff } from 'lucide-react'

export default function ForgotPassword() {
  const [username, setUsername] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [timer, setTimer] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

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

  const strength = getPasswordStrength(newPassword)

  function formatErrorMessage(err) {
    if (!err.response?.data) return 'Password reset failed. Please check your details.'
    const data = err.response.data
    if (typeof data === 'string') return data
    if (typeof data === 'object') {
      if (data.message) return data.message
      if (data.error) return data.error
      const values = Object.values(data)
      if (values.length > 0 && typeof values[0] === 'string') {
        return values.join('. ')
      }
      return JSON.stringify(data)
    }
    return 'Password reset failed.'
  }

  async function sendOtp() {
    const cleanEmail = username.trim()
    if (!cleanEmail) return showToast('Enter your registered email address first', 'error')

    setSending(true)
    try {
      await api.post(`/auth/send-otp?username=${encodeURIComponent(cleanEmail)}`)
      showToast('Password reset OTP sent to your email!', 'success')
      setTimer(60)
    } catch (err) {
      showToast(formatErrorMessage(err), 'error')
    } finally {
      setSending(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanEmail = username.trim()
    const cleanOtp = otp.trim()

    if (!cleanEmail) return showToast('Please enter your email address', 'error')
    if (!cleanOtp) return showToast('Please enter the 6-digit OTP code', 'error')
    if (newPassword.length < 8 || newPassword.length > 15) {
      return showToast('New password must be between 8 and 15 characters long', 'error')
    }

    setResetting(true)
    try {
      await api.put('/auth/verify-otp', {
        username: cleanEmail,
        otp: cleanOtp,
        newPassword: newPassword
      })
      showToast('Password reset successfully! Please sign in with your new password.', 'success')
      navigate('/login')
    } catch (err) {
      showToast(formatErrorMessage(err), 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-up">
        <div style={{ marginBottom: '16px' }}>
          <h1 className="auth-title" style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>Forgot Password</h1>
          <p className="auth-subtitle" style={{ margin: '2px 0 0 0' }}>Reset your ThaparOnWheelz account password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your registered email address"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">6-Digit OTP</label>
              <button
                type="button"
                onClick={sendOtp}
                disabled={sending || timer > 0}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                {sending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Send OTP'}
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-digit OTP code"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password (8-15 chars)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: '40px' }}
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
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
            {newPassword && (
              <div style={{ fontSize: '11px', color: strength.color, fontWeight: 700, marginTop: '2px' }}>
                Password Strength: {strength.label}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={resetting} style={{ marginTop: '0.5rem' }}>
            {resetting ? <span className="loader" /> : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your password? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
