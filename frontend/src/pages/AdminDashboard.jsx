import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getStatusBadge, getPriorityBadge, getPriorityColor, timeAgo } from '../utils/helpers'

const STATUSES   = ['all', 'pending', 'in-progress', 'resolved', 'rejected']
const CATEGORIES = ['all', 'Wi-Fi', 'Hostel', 'Maintenance', 'Canteen', 'Infrastructure', 'Library', 'Transport', 'Academic', 'Other']
const PRIORITIES = ['all', 'low', 'medium', 'high', 'urgent']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState({ status: 'all', category: 'all', priority: 'all', search: '' })

  // Listen for navbar tab switch event
  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail || 'complaints')
    window.addEventListener('switch-tab', handler)
    return () => window.removeEventListener('switch-tab', handler)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/complaints'),
        ])
        setStats(statsRes.data)
        setComplaints(complaintsRes.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (activeTab !== 'complaints') return
    const fetch = async () => {
      try {
        const params = {}
        if (filters.status !== 'all') params.status = filters.status
        if (filters.category !== 'all') params.category = filters.category
        if (filters.priority !== 'all') params.priority = filters.priority
        if (filters.search) params.search = filters.search
        const res = await api.get('/complaints', { params })
        setComplaints(res.data)
      } catch (err) { console.error(err) }
    }
    fetch()
  }, [filters, activeTab])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  )

  const catEntries = Object.entries(stats?.categoryBreakdown || {}).sort((a, b) => b[1] - a[1])
  const maxCat = Math.max(...catEntries.map(e => e[1]), 1)

  return (
    <div className="slide-up">
      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-item${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`tab-item${activeTab === 'complaints' ? ' active' : ''}`} onClick={() => setActiveTab('complaints')}>
          📋 All Complaints
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card" style={{ '--stat-color': '#006AA7', '--stat-bg': '#E5F2FA' }}>
              <div className="stat-icon">📋</div>
              <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Complaints</div></div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#D97706', '--stat-bg': '#FEF3C7' }}>
              <div className="stat-icon">⏳</div>
              <div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#006AA7', '--stat-bg': '#E5F2FA' }}>
              <div className="stat-icon">🔄</div>
              <div><div className="stat-value">{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#059669', '--stat-bg': '#ECFDF5' }}>
              <div className="stat-icon">✅</div>
              <div><div className="stat-value">{stats.resolved}</div><div className="stat-label">Resolved</div></div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#DC2626', '--stat-bg': '#FEF2F2' }}>
              <div className="stat-icon">🚨</div>
              <div><div className="stat-value">{stats.urgent}</div><div className="stat-label">Urgent Open</div></div>
            </div>
          </div>

          <div className="admin-grid">
            {/* Category Chart */}
            <div className="card">
              <div className="card-header"><span className="card-title">📊 By Category</span></div>
              <div className="card-body">
                <div className="chart-bar-container">
                  {catEntries.length === 0
                    ? <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem' }}>No data yet</p>
                    : catEntries.map(([cat, count]) => (
                      <div key={cat} className="chart-bar-row">
                        <div className="chart-bar-label">{cat}</div>
                        <div className="chart-bar-track">
                          <div className="chart-bar-fill" style={{ width: `${(count / maxCat) * 100}%` }} />
                        </div>
                        <div className="chart-bar-count">{count}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Status Chart */}
            <div className="card">
              <div className="card-header"><span className="card-title">📈 Status Breakdown</span></div>
              <div className="card-body">
                {[
                  { label: 'Pending',     value: stats.pending,    color: '#D97706' },
                  { label: 'In Progress', value: stats.inProgress, color: '#006AA7' },
                  { label: 'Resolved',    value: stats.resolved,   color: '#059669' },
                  { label: 'Rejected',    value: stats.rejected,   color: '#DC2626' },
                ].map(item => (
                  <div key={item.label} className="chart-bar-row" style={{ marginBottom: 12 }}>
                    <div className="chart-bar-label">{item.label}</div>
                    <div className="chart-bar-track">
                      <div style={{
                        height: '100%', borderRadius: 4, background: item.color, transition: 'width 0.6s ease',
                        width: `${stats.total ? (item.value / stats.total) * 100 : 0}%`
                      }} />
                    </div>
                    <div className="chart-bar-count">{item.value}</div>
                  </div>
                ))}
                <div className="divider" />
                <div style={{ fontSize: '0.87rem', color: 'var(--text-sub)' }}>
                  Resolution Rate:{' '}
                  <strong style={{ color: '#059669' }}>
                    {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="card admin-full">
              <div className="card-header">
                <span className="card-title">🕐 Recent Complaints</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('complaints')}>View All →</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th><th>Student</th><th>Category</th>
                      <th>Priority</th><th>Status</th><th>Submitted</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentComplaints?.map(c => {
                      const s = getStatusBadge(c.status)
                      const p = getPriorityBadge(c.priority)
                      return (
                        <tr key={c._id || c.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text)', maxWidth: 200 }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{c.studentName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.rollNo}</div>
                          </td>
                          <td><span className="badge badge-category">{c.category}</span></td>
                          <td><span className={`badge ${p.cls}`}>{p.label}</span></td>
                          <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                          <td>{timeAgo(c.createdAt)}</td>
                          <td>
                            <Link to={`/complaints/${c._id || c.id}`} className="btn btn-outline btn-sm">View</Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'complaints' && (
        <>
          <div className="section-header">
            <h3 className="section-title">All Complaints</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{complaints.length} records</span>
          </div>

          <div className="filters-bar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                placeholder="Search by title, location..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <select className="filter-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
            <select className="filter-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
            <select className="filter-select" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priority' : p}</option>)}
            </select>
          </div>

          {complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No complaints found</div>
              <div className="empty-state-text">Try adjusting your filters</div>
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
                      <div>
                        <div className="complaint-card-title">{c.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {c.studentName} · {c.rollNo} · {c.department}
                        </div>
                      </div>
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
                        {c.comments?.length > 0 && <span className="tag">💬 {c.comments.length}</span>}
                      </div>
                      <span>{timeAgo(c.createdAt)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
