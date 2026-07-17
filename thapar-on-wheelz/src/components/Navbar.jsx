import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Zap } from 'lucide-react'

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
          <div className="navbar-logo-icon">🛺</div>
          <div>
            <div className="navbar-logo-text">ThaparOnWheelz</div>
            <div className="navbar-logo-sub">Campus e-rickshaw booking</div>
          </div>
        </div>

        {/* Right: User profile / logout */}
        {user && (
          <div className="navbar-right">
            <span className="navbar-role-tag">{role}</span>
            <span className="navbar-username">{user.name || user.username}</span>
            <button className="navbar-logout" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
