import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fill = (type) => {
    if (type === 'student') setForm({ email: 'student1@campus.edu', password: 'student123' })
    else setForm({ email: 'admin@campus.edu', password: 'admin123' })
  }

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <span className="auth-logo-text">collegeComplaints</span>
        </div>
        <div className="auth-hero">
          <h1>Your Campus,<br /><span>Your Voice.</span></h1>
          <p>
            A smart platform to raise, track, and resolve campus complaints —
            hostel, Wi-Fi, maintenance, and more.
          </p>
        </div>
        <div className="auth-features">
          {[
            'Submit complaints with photo evidence',
            'Real-time status tracking',
            'Direct communication with admin',
            'Transparent resolution workflow',
          ].map((f, i) => (
            <div key={i} className="auth-feature-item">
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Sign In</h2>
          <p>Log in to your campus account</p>

          <div className="auth-demo-box">
            <strong>🧪 Demo Accounts</strong>
            <div className="auth-demo-btns">
              <button className="btn btn-ghost btn-sm" onClick={() => fill('student')}>Fill Student</button>
              <button className="btn btn-ghost btn-sm" onClick={() => fill('admin')}>Fill Admin</button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? '⏳ Signing in...' : '🔑 Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.87rem', color: 'var(--text-muted)' }}>
            New student?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>
              Create Account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
