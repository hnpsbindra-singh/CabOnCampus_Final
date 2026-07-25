import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
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
    <>
      {/* Top Institutional Ribbon */}
      <div className="top-ribbon">
        <div className="top-ribbon-left">
          <span className="top-ribbon-tag">TIET</span>
          <span>Thapar Institute of Engineering & Technology • Campus Shuttle Service</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Flat Rate: ₹10 / Ride</span>
        </div>
      </div>

      <header className="navbar-container">
        <div className="navbar-main">
          {/* Left: Logo */}
          <div className="navbar-logo" onClick={() => navigate(roleDash())}>
            <div>
              <div className="navbar-logo-text">ThaparOnWheelz</div>
              <div className="navbar-logo-sub">Campus Rickshaw Booking Portal</div>
            </div>
          </div>

          {/* Right: User profile / logout */}
          {user && (
            <div className="navbar-right">
              <span className="navbar-role-tag">{role}</span>
              <img 
                src={getAvatarSvg(user.username)} 
                alt="avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid var(--gold)' }}
              />
              <span className="navbar-username">{user.name || user.username}</span>
              <button className="navbar-logout" onClick={handleLogout} title="Logout">
                <LogOut size={14} /> <span className="navbar-logout-text">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
