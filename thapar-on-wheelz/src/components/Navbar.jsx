import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Zap, Car } from 'lucide-react'
import { getAvatarSvg } from '../api/avatar'

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const roleDash = () => {
    if (role === 'STUDENT') return '/student'
    if (role === 'DRIVER') return '/driver'
    if (role === 'ADMIN') return '/admin'
    return '/'
  }

  return (
    <header className="navbar-container">
      <div className="navbar-main">
        {/* Left: Logo */}
        <div className="navbar-logo" onClick={() => navigate(roleDash())}>
          <div className="navbar-logo-icon">
            <Car size={20} color="#ffffff" />
          </div>
          <div>
            <div className="navbar-logo-text">ThaparOnWheelz</div>
            <div className="navbar-logo-sub">Campus e-rickshaw booking</div>
          </div>
        </div>

        {/* Right: User profile / logout */}
        {user && (
          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="navbar-role-tag">{role}</span>
            <img 
              src={getAvatarSvg(user.username)} 
              alt="avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid rgba(255,255,255,0.2)' }}
            />
            <span className="navbar-username">{user.name || user.username}</span>
            <button className="navbar-logout" onClick={handleLogout} title="Logout">
              <LogOut size={14} /> <span className="navbar-logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
