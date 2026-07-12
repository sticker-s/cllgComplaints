import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { toast } from 'react-toastify'

const CATEGORIES = ['Wi-Fi', 'Hostel', 'Maintenance', 'Canteen', 'Infrastructure', 'Library', 'Transport', 'Academic', 'Other']

const PRIORITIES = [
  { value: 'low',    label: '🔵 Low',    desc: 'Minor issue, not urgent' },
  { value: 'medium', label: '🟡 Medium', desc: 'Needs attention soon' },
  { value: 'high',   label: '🔴 High',   desc: 'Causing significant problems' },
  { value: 'urgent', label: '🚨 Urgent', desc: 'Emergency — act immediately' },
]

export default function NewComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', category: 'Maintenance', priority: 'medium', location: ''
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleImages = e => {
    const files = Array.from(e.target.files).slice(0, 3)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removeImage = idx => {
    setImages(imgs => imgs.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title.trim())       return toast.error('Title is required')
    if (!form.description.trim()) return toast.error('Description is required')
    if (!form.location.trim())    return toast.error('Location is required')

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      images.forEach(img => formData.append('images', img))

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Complaint submitted successfully!')
      navigate(`/complaints/${res.data._id || res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="new-complaint-wrap slide-up">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="form-card">
        <div className="form-card-title">📝 Submit a Complaint</div>
        <div className="form-card-sub">Provide clear details so the team can resolve your issue quickly.</div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>Complaint Title *</label>
            <input
              className="form-input"
              name="title"
              placeholder="e.g. Wi-Fi not working in Block C"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </div>

          {/* Category + Location */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input
                className="form-input"
                name="location"
                placeholder="e.g. Hostel B, Room 302"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority Level *</label>
            <div className="priority-grid">
              {PRIORITIES.map(p => (
                <div
                  key={p.value}
                  className={`priority-option${form.priority === p.value ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                >
                  <div>
                    <div className="priority-option-label">{p.label}</div>
                    <div className="priority-option-sub">{p.desc}</div>
                  </div>
                  {form.priority === p.value && (
                    <span style={{ marginLeft: 'auto', color: 'var(--blue)', fontWeight: 700 }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Describe the issue in detail — what happened, when it started, how many people are affected..."
              value={form.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          {/* Images */}
          <div className="form-group">
            <label>Attach Photos (optional, max 3)</label>
            <div className="image-upload-zone">
              <input type="file" accept="image/*" multiple onChange={handleImages} />
              <div className="image-upload-icon">📸</div>
              <div className="image-upload-text">Click or drag to upload images</div>
              <div className="image-upload-sub">PNG, JPG, WEBP · Max 5MB each</div>
            </div>
            {previews.length > 0 && (
              <div className="image-preview-grid">
                {previews.map((src, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={src} alt={`preview ${idx + 1}`} />
                    <button className="image-remove-btn" type="button" onClick={() => removeImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="info-note">
            ℹ️ Your complaint will be reviewed by the admin team. You'll receive real-time status updates here.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
              {loading ? '⏳ Submitting...' : '🚀 Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
