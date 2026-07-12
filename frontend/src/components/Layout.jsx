import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="avatar-btn" onClick={() => setOpen(o => !o)}>
        {initials}
      </button>

      {open && (
        <div className="dropdown">
          <div className="dropdown-header">
            <div className="dropdown-name">{user?.name}</div>
            <div className="dropdown-email">{user?.email}</div>
            <span className="dropdown-role">
              {user?.role === 'admin' ? '🛡️ Admin' : '👨‍🎓 Student'}
            </span>
          </div>

          {user?.role === 'student' && (
            <>
              <div className="dropdown-item" style={{ pointerEvents: 'none', opacity: 0.6 }}>
                📋 {user.rollNo} · {user.department}
              </div>
            </>
          )}

          <button
            className="dropdown-item danger"
            onClick={() => { setOpen(false); onLogout() }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.info('Logged out successfully')
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar">
        {/* Brand */}
        <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <div className="navbar-brand-icon">🎓</div>
          <span className="navbar-brand-name">CampusVoice</span>
        </NavLink>

        {/* Nav Links */}
        <div className="navbar-nav">
          {isAdmin ? (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                📊 Dashboard
              </NavLink>
              <NavLink
                to="/admin?tab=complaints"
                className={({ isActive }) => `nav-link`}
                onClick={e => {
                  e.preventDefault()
                  navigate('/admin')
                  // small delay to let page mount, then switch tab via query
                  setTimeout(() => window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'complaints' })), 50)
                }}
              >
                📋 All Complaints
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                🏠 My Complaints
              </NavLink>
              <NavLink
                to="/complaints/new"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                ➕ New Complaint
              </NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <AvatarDropdown user={user} onLogout={handleLogout} />
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="page-wrap fade-in">
        {children}
      </div>
    </div>
  )
}
