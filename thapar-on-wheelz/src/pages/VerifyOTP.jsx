import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Shield } from 'lucide-react'

export default function VerifyOTP() {
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const navigate = useNavigate()

  const isResetFlow = searchParams.get('reset') === 'true'

  async function sendOtp() {
    if (!username) return showToast('Enter username first', 'error')
    setSending(true)
    try {
      await api.post(`/auth/send-otp?username=${encodeURIComponent(username)}`)
      showToast('OTP sent to your email!', 'success')
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

          <button type="button" className="btn btn-outline btn-full" onClick={sendOtp} disabled={sending}>
            {sending ? <span className="loader" style={{ borderTopColor: 'var(--primary)' }} /> : '⚡ Send OTP'}
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
              <input
                type="password"
                className="form-input"
                placeholder="8-15 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={verifying}>
            {verifying ? <span className="loader" /> : isResetFlow ? 'Reset Password →' : 'Verify Registration →'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
