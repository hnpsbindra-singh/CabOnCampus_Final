import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Shield, Eye, EyeOff, Lock, Key } from 'lucide-react'

export default function VerifyOTP() {
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [timer, setTimer] = useState(0)
  
  const navigate = useNavigate()
  const isResetFlow = searchParams.get('reset') === 'true'

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
    if (score === 2 || score === 3) return { score, label: 'Medium', color: '#d97706' }
    return { score, label: 'Strong', color: '#059669' }
  }

  const strength = getPasswordStrength(newPassword)

  async function sendOtp() {
    if (!username) return showToast('Enter username first', 'error')
    setSending(true)
    try {
      await api.post(`/auth/send-otp?username=${encodeURIComponent(username)}`)
      showToast('OTP sent to your email!', 'success')
      setTimer(60)
    } catch (err) {
      showToast(err.response?.data || 'Failed to send OTP', 'error')
    } finally {
      setSending(false)
    }
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setVerifying(true)
    try {
      if (isResetFlow) {
        if (newPassword.length < 8 || newPassword.length > 15) {
          showToast('Password must be between 8 and 15 characters', 'error')
          setVerifying(false)
          return
        }
        await api.put('/auth/verify-otp', {
          username,
          otp: String(otp),
          newPassword
        })
        showToast('Password updated successfully! Please login.', 'success')
      } else {
        await api.post('/auth/verify', {
          username,
          otp: String(otp)
        })
        showToast('Verified! Please login.', 'success')
      }
      navigate('/login')
    } catch (err) {
      showToast(err.response?.data || 'Invalid or expired OTP', 'error')
    } finally {
      setVerifying(false)
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
      <div className="auth-card animate-scale">
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={28} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
              {isResetFlow ? 'Reset Password' : 'Verify OTP'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {isResetFlow
              ? 'Enter OTP and your new password to reset your credentials'
              : 'Enter the OTP sent to your registered email'}
          </p>
        </div>

        <form onSubmit={verifyOtp} className="auth-form" style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Username / Email</label>
            <input
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="you@thapar.edu"
              required
            />
          </div>

          <button type="button" className="btn btn-outline btn-full" onClick={sendOtp} disabled={sending || timer > 0}>
            {sending ? (
              <span className="loader" style={{ borderTopColor: 'var(--primary)' }} />
            ) : timer > 0 ? (
              `Resend OTP in ${timer}s`
            ) : (
              'Send OTP'
            )}
          </button>

          <div className="form-group">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-input"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
          </div>

          {isResetFlow && (
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="8-15 characters"
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
          )}

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={verifying}>
            {verifying ? <span className="loader" /> : isResetFlow ? 'Reset Password' : 'Verify Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
