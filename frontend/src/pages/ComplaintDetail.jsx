import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getStatusBadge, getPriorityBadge, formatDateTime, timeAgo } from '../utils/helpers'
import { toast } from 'react-toastify'

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending',     dot: 'pending' },
  { value: 'in-progress', label: 'In Progress', dot: 'in-progress' },
  { value: 'resolved',    label: 'Resolved',    dot: 'resolved' },
  { value: 'rejected',    label: 'Rejected',    dot: 'rejected' },
]

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState('')
  const [lightboxImg, setLightboxImg] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data)
      setSelectedStatus(res.data.status)
      setSelectedAdmin(res.data.assignedTo?._id || res.data.assignedTo || '')
      if (user?.role === 'admin') {
        const admRes = await api.get('/admin/admins')
        setAdmins(admRes.data)
      }
    } catch {
      toast.error('Complaint not found')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComplaint() }, [id])

  const submitComment = async e => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/complaints/${id}/comments`, { text: commentText })
      setComplaint(c => ({ ...c, comments: [...c.comments, res.data] }))
      setCommentText('')
      toast.success('Comment added')
    } catch { toast.error('Failed to add comment') }
    finally { setSubmittingComment(false) }
  }

  const updateStatus = async () => {
    setUpdatingStatus(true)
    try {
      const body = { status: selectedStatus }
      if (selectedAdmin !== undefined) body.assignedTo = selectedAdmin
      const res = await api.patch(`/complaints/${id}/status`, body)
      setComplaint(res.data)
      toast.success('Status updated successfully ✅')
    } catch { toast.error('Failed to update status') }
    finally { setUpdatingStatus(false) }
  }

  const deleteComplaint = async () => {
    try {
      await api.delete(`/complaints/${id}`)
      toast.success('Complaint deleted')
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  )
  if (!complaint) return null

  const status = getStatusBadge(complaint.status)
  const priority = getPriorityBadge(complaint.priority)
  const cid = complaint._id || complaint.id

  return (
    <div className="slide-up">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-grid">
        {/* ── LEFT: Main Content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Complaint Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎫 Complaint #{cid.toString().slice(-8).toUpperCase()}</span>
              {(user?.role === 'admin' || complaint.userId === user?._id || complaint.userId?.toString() === user?._id?.toString()) && (
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(true)}>🗑 Delete</button>
              )}
            </div>
            <div className="card-body">
              <div className="complaint-title-detail">{complaint.title}</div>
              <div className="complaint-meta-row">
                <span className={`badge ${status.cls}`}>{status.label}</span>
                <span className={`badge ${priority.cls}`}>{priority.label}</span>
                <span className="badge badge-category">📁 {complaint.category}</span>
              </div>
              <p className="complaint-description">{complaint.description}</p>

              <div className="detail-info-grid">
                <div className="info-item">
                  <div className="info-label">Submitted By</div>
                  <div className="info-value">👤 {complaint.studentName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Roll Number</div>
                  <div className="info-value">{complaint.rollNo}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Department</div>
                  <div className="info-value">{complaint.department}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Location</div>
                  <div className="info-value">📍 {complaint.location}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Submitted On</div>
                  <div className="info-value">{formatDateTime(complaint.createdAt)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Last Updated</div>
                  <div className="info-value">{timeAgo(complaint.updatedAt)}</div>
                </div>
                {complaint.assignedToName && (
                  <div className="info-item">
                    <div className="info-label">Assigned To</div>
                    <div className="info-value">🛡️ {complaint.assignedToName}</div>
                  </div>
                )}
                {complaint.resolvedAt && (
                  <div className="info-item">
                    <div className="info-label">Resolved On</div>
                    <div className="info-value">✅ {formatDateTime(complaint.resolvedAt)}</div>
                  </div>
                )}
              </div>

              {complaint.images?.length > 0 && (
                <>
                  <div className="info-label" style={{ marginBottom: 8 }}>Attached Photos</div>
                  <div className="complaint-images">
                    {complaint.images.map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:5000${img}`}
                        alt={`attachment ${i + 1}`}
                        className="complaint-image"
                        onClick={() => setLightboxImg(`http://localhost:5000${img}`)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><span className="card-title">📅 Activity Timeline</span></div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-line">
                    <div className="timeline-dot" style={{ background: '#D97706' }} />
                    <div className="timeline-connector" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-event">Complaint submitted</div>
                    <div className="timeline-time">{formatDateTime(complaint.createdAt)}</div>
                  </div>
                </div>
                {complaint.assignedToName && (
                  <div className="timeline-item">
                    <div className="timeline-line">
                      <div className="timeline-dot" style={{ background: 'var(--blue)' }} />
                      <div className="timeline-connector" />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-event">Assigned to {complaint.assignedToName}</div>
                      <div className="timeline-time">{timeAgo(complaint.updatedAt)}</div>
                    </div>
                  </div>
                )}
                {complaint.status === 'in-progress' && (
                  <div className="timeline-item">
                    <div className="timeline-line">
                      <div className="timeline-dot" style={{ background: '#0891B2' }} />
                      <div className="timeline-connector" />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-event">Work in progress</div>
                      <div className="timeline-time">{timeAgo(complaint.updatedAt)}</div>
                    </div>
                  </div>
                )}
                {complaint.resolvedAt && (
                  <div className="timeline-item">
                    <div className="timeline-line">
                      <div className="timeline-dot" style={{ background: '#059669' }} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-event">✅ Resolved</div>
                      <div className="timeline-time">{formatDateTime(complaint.resolvedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">💬 Comments ({complaint.comments?.length || 0})</span>
            </div>
            <div className="card-body">
              {complaint.comments?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', textAlign: 'center', padding: '16px 0' }}>
                  No comments yet
                </p>
              ) : (
                <div className="comments-list">
                  {complaint.comments.map((c, idx) => (
                    <div key={c._id || idx} className="comment-item">
                      <div className={`comment-avatar ${c.role === 'admin' ? 'admin-av' : 'student-av'}`}>
                        {c.author?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{c.author}</span>
                          <span className={`badge badge-${c.role}`} style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                            {c.role}
                          </span>
                          <span className="comment-time">{timeAgo(c.createdAt)}</span>
                        </div>
                        <div className="comment-text">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form className="comment-form" onSubmit={submitComment}>
                <input
                  className="form-input"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" type="submit"
                  disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Status Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {user?.role === 'admin' ? '⚙️ Manage' : '📊 Status'}
              </span>
            </div>
            <div className="card-body">
              {user?.role === 'admin' ? (
                <>
                  <div className="form-group">
                    <label>Update Status</label>
                    <div className="status-control">
                      {STATUS_OPTIONS.map(opt => (
                        <div
                          key={opt.value}
                          className={`status-option${selectedStatus === opt.value ? ' selected' : ''}`}
                          onClick={() => setSelectedStatus(opt.value)}
                        >
                          <div className={`status-dot ${opt.dot}`} />
                          <div className="status-option-label">{opt.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label>Assign To</label>
                    <select className="form-select" value={selectedAdmin} onChange={e => setSelectedAdmin(e.target.value)}>
                      <option value="">— Unassigned —</option>
                      {admins.map(a => (
                        <option key={a._id} value={a._id}>{a.name} ({a.department})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={updateStatus}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? '⏳ Saving...' : '💾 Save Changes'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: 10 }}>
                    {complaint.status === 'pending'     && '⏳'}
                    {complaint.status === 'in-progress' && '🔄'}
                    {complaint.status === 'resolved'    && '✅'}
                    {complaint.status === 'rejected'    && '❌'}
                  </div>
                  <span className={`badge ${status.cls}`} style={{ fontSize: '0.85rem', padding: '5px 14px' }}>
                    {status.label}
                  </span>
                  <p style={{ marginTop: 12, fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {complaint.status === 'pending'     && 'Your complaint is waiting to be reviewed by the admin team.'}
                    {complaint.status === 'in-progress' && 'The admin team is actively working on your complaint.'}
                    {complaint.status === 'resolved'    && 'Your complaint has been successfully resolved.'}
                    {complaint.status === 'rejected'    && 'Your complaint was rejected. Please contact the admin directly.'}
                  </p>
                  {complaint.assignedToName && (
                    <>
                      <div className="divider" />
                      <div className="info-item" style={{ textAlign: 'left' }}>
                        <div className="info-label">Assigned To</div>
                        <div className="info-value">🛡️ {complaint.assignedToName}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="card">
            <div className="card-header"><span className="card-title">ℹ️ Details</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="info-item">
                <div className="info-label">Priority</div>
                <span className={`badge ${priority.cls}`}>{priority.label}</span>
              </div>
              <div className="info-item">
                <div className="info-label">Category</div>
                <span className="badge badge-category">{complaint.category}</span>
              </div>
              <div className="info-item">
                <div className="info-label">Photos</div>
                <div className="info-value">{complaint.images?.length || 0} attached</div>
              </div>
              <div className="info-item">
                <div className="info-label">Comments</div>
                <div className="info-value">{complaint.comments?.length || 0} total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="modal-overlay" onClick={() => setLightboxImg(null)}>
          <img
            src={lightboxImg} alt="enlarged"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">🗑 Delete Complaint?</div>
            <div className="modal-text">
              This action cannot be undone. The complaint, all comments, and attached files will be permanently deleted.
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteComplaint}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
