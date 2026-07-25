import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { showToast } from '../components/Toast'

export default function VerifyOTP() {
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  
  const navigate = useNavigate()

  function formatErrorMessage(err) {
    if (!err.response?.data) return 'Verification failed. Please check your OTP code.'
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
    return 'Verification failed.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanEmail = username.trim()
    const cleanOtp = otp.trim()

    if (!cleanEmail) return showToast('Please enter your email address', 'error')
    if (!cleanOtp) return showToast('Please enter the 6-digit OTP code', 'error')

    setVerifying(true)
    try {
      await api.post('/auth/verify', {
        username: cleanEmail,
        otp: cleanOtp
      })
      showToast('Account verified successfully! Please sign in.', 'success')
      navigate('/login')
    } catch (err) {
      showToast(formatErrorMessage(err), 'error')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-up">
        <div style={{ marginBottom: '16px' }}>
          <h1 className="auth-title" style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>Verify Account</h1>
          <p className="auth-subtitle" style={{ margin: '2px 0 0 0' }}>Enter the 6-digit OTP code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="yourname@thapar.edu"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit Registration OTP</label>
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

          <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={verifying} style={{ marginTop: '0.5rem' }}>
            {verifying ? <span className="loader" /> : 'Verify Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already verified? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
