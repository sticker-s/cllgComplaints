import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getStatusBadge, getPriorityBadge, getPriorityColor, timeAgo } from '../utils/helpers'

const CATEGORIES = ['all', 'Wi-Fi', 'Hostel', 'Maintenance', 'Canteen', 'Infrastructure', 'Library', 'Transport', 'Academic', 'Other']
const STATUSES = ['all', 'pending', 'in-progress', 'resolved', 'rejected']
const PRIORITIES = ['all', 'low', 'medium', 'high', 'urgent']

export default function StudentDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all', category: 'all', priority: 'all', search: '' })

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        if (filters.status !== 'all') params.status = filters.status
        if (filters.category !== 'all') params.category = filters.category
        if (filters.priority !== 'all') params.priority = filters.priority
        if (filters.search) params.search = filters.search
        const res = await api.get('/complaints', { params })
        setComplaints(res.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [filters])

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <div className="slide-up">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>{user?.rollNo} · {user?.department} · {user?.year}</p>
        </div>
        <Link to="/complaints/new" className="btn btn-yellow btn-lg">
          ➕ New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#006AA7', '--stat-bg': '#E5F2FA' }}>
          <div className="stat-icon">📋</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#D97706', '--stat-bg': '#FEF3C7' }}>
          <div className="stat-icon">⏳</div>
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#006AA7', '--stat-bg': '#E5F2FA' }}>
          <div className="stat-icon">🔄</div>
          <div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#059669', '--stat-bg': '#ECFDF5' }}>
          <div className="stat-icon">✅</div>
          <div>
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Complaints Section */}
      <div className="section-header">
        <h3 className="section-title">My Complaints </h3>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{complaints.length} total</span>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Search complaints..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No complaints found</div>
          <div className="empty-state-text">
            {filters.search || filters.status !== 'all' || filters.category !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't submitted any complaints yet"}
          </div>
          <Link to="/complaints/new" className="btn btn-primary">➕ Submit First Complaint</Link>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map(c => {
            const status = getStatusBadge(c.status)
            const priority = getPriorityBadge(c.priority)
            return (
              <Link
                key={c._id || c.id}
                to={`/complaints/${c._id || c.id}`}
                className="complaint-card"
                style={{ '--priority-color': getPriorityColor(c.priority) }}
              >
                <div className="complaint-card-top">
                  <div className="complaint-card-title">{c.title}</div>
                  <div className="complaint-card-meta">
                    <span className={`badge ${status.cls}`}>{status.label}</span>
                    <span className={`badge ${priority.cls}`}>{priority.label}</span>
                  </div>
                </div>
                <div className="complaint-card-desc">{c.description}</div>
                <div className="complaint-card-footer">
                  <div className="complaint-card-footer-left">
                    <span className="tag">📁 {c.category}</span>
                    <span className="tag">📍 {c.location}</span>
                    {c.assignedToName && <span className="tag">👤 {c.assignedToName}</span>}
                  </div>
                  <span>{timeAgo(c.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
