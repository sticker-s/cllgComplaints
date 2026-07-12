import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

// ── NEW APPROACH: Floating Glassmorphism Cards ──
// This creates a modern parallax effect with abstract UI "tickets"
// floating over a glowing ambient background.
function AnimatedHeroBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    setMouse({ x, y })
  }

  const cards = [
    {
      id: 1,
      icon: '📶',
      title: 'Wi-Fi Issue',
      color: '#3b82f6',
      top: '15%',
      left: '65%',
      delay: '0s',
      depth: 15,
    },
    {
      id: 2,
      icon: '🍔',
      title: 'Cafeteria Feedback',
      color: '#f59e0b',
      top: '45%',
      left: '60%',
      delay: '-2s',
      depth: -20,
    },
    {
      id: 3,
      icon: '🔧',
      title: 'Maintenance',
      color: '#10b981',
      top: '70%',
      left: '15%',
      delay: '-4s',
      depth: 25,
    }
  ]

  return (
    <div
      className="hero-container"
      onMouseMove={handleMouseMove}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0f172a', // Deep background
        zIndex: 0
      }}
    >
      {/* Ambient Glowing Blobs */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      {/* Floating Parallax Cards */}
      <div className="cards-wrapper">
        {cards.map((card) => {
          // Calculate parallax movement based on mouse position and card "depth"
          const moveX = mouse.x * card.depth
          const moveY = mouse.y * card.depth
          const rotateX = mouse.y * 10
          const rotateY = mouse.x * -10

          return (
            <div
              key={card.id}
              className="floating-card"
              style={{
                top: card.top,
                left: card.left,
                animationDelay: card.delay,
                transform: `translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              }}
            >
              <div className="card-icon" style={{ background: `${card.color}22`, color: card.color }}>
                {card.icon}
              </div>
              <div className="card-content">
                <div className="card-skeleton-title"></div>
                <div className="card-skeleton-line" style={{ width: '100%' }}></div>
                <div className="card-skeleton-line" style={{ width: '60%' }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

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
    <>
      <style>{`
        /* ── NEW LOGIN ANIMATION STYLES ── */
        .ambient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: blobFloat 10s infinite alternate ease-in-out;
        }
        .blob-1 {
          width: 400px;
          height: 400px;
          background: #3b82f6; /* Blue */
          top: -100px;
          left: -100px;
        }
        .blob-2 {
          width: 300px;
          height: 300px;
          background: #fecc02; /* Campus Yellow */
          bottom: -50px;
          right: -50px;
          animation-delay: -5s;
        }

        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 50px) scale(1.1); }
        }

        .cards-wrapper {
          position: absolute;
          inset: 0;
          perspective: 1000px; /* Required for 3D tilt effect */
        }

        .floating-card {
          position: absolute;
          width: 220px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          gap: 16px;
          animation: floatBob 6s infinite ease-in-out;
          transition: transform 0.15s ease-out; /* Smooths the mouse parallax */
          will-change: transform;
        }

        @keyframes floatBob {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -20px; }
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .card-skeleton-title {
          height: 12px;
          width: 80%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .card-skeleton-line {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        @keyframes hintFade {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.65; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── LEFT PANEL ── */}
        <div className="auth-left" style={{ position: 'relative', overflow: 'hidden', justifyContent: 'flex-start', paddingTop: 48 }}>

          {/* Replaced ParticleField with the new Animated Hero */}
          <AnimatedHeroBackground />

          <div style={{
            position: 'relative', zIndex: 1,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            pointerEvents: 'none' // Ensures background catches mouse events
          }}>
            <div className="auth-logo" style={{ marginBottom: 28 }}>
              <div className="auth-logo-icon" style={{ background: 'var(--yellow)', color: '#000', borderRadius: '8px', padding: '4px' }}>🎓</div>
              <span className="auth-logo-text" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>collegeComplaints</span>
            </div>

            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.5px', textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              Your campus, <br />
              <span style={{ color: 'var(--yellow)' }}>
                your voice.
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '16px', maxWidth: '80%', fontSize: '1.1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              The central hub for resolving issues, tracking maintenance, and improving student life.
            </p>
          </div>

          <div style={{
            position: 'relative', zIndex: 1,
            marginTop: 'auto',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.5px',
            animation: mounted ? 'hintFade 3s ease-in-out infinite' : 'none',
            opacity: mounted ? undefined : 0,
            transition: 'opacity 0.6s ease 0.4s',
            pointerEvents: 'none',
            paddingBottom: '20px'
          }}>
            Move your cursor to interact ✦
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          <div className="auth-card">
            <h2>Sign In</h2>
            <p>Log in to your campus account</p>

            <div className="auth-demo-box">
              <strong>🧪 Demo Accounts</strong>
              <div className="auth-demo-btns">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('student')}>Fill Student</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('admin')}>Fill Admin</button>
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
    </>
  )
}