import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Information Technology', 'Electrical', 'Other']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    rollNo: '', department: 'Computer Science', year: '1st Year'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        rollNo: form.rollNo, department: form.department, year: form.year
      })
      toast.success('Account created successfully! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <span className="auth-logo-text">collegeComplaints</span>
        </div>
        <div className="auth-hero">
          <h1>Join <span>collegeComplaints</span></h1>
          <p>Register as a student to start submitting and tracking your campus complaints instantly.</p>
        </div>
        <div className="auth-features">
          {[
            'Free for all enrolled students',
            'Instant complaint submission',
            'Track resolution in real-time',
            'Communicate with admin staff',
          ].map((f, i) => (
            <div key={i} className="auth-feature-item">
              <div className="auth-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: 500 }}>
          <h2>Create Account</h2>
          <p>Register with your college credentials</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Roll Number *</label>
                <input className="form-input" name="rollNo" placeholder="CS2021001" value={form.rollNo} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Year</label>
                <select className="form-select" name="year" value={form.year} onChange={handleChange}>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-select" name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>College Email *</label>
              <input className="form-input" name="email" type="email" placeholder="you@campus.edu" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input className="form-input" name="password" type="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input className="form-input" name="confirmPassword" type="password" placeholder="Repeat" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? '⏳ Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <div className="divider" style={{ margin: '22px 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.87rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
