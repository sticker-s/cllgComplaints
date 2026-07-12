const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const Complaint = require('../models/Complaint')
const User = require('../models/User')
const { auth, adminOnly } = require('../middleware/auth')

// Multer setup
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// ── GET /api/complaints  (student: own | admin: all) ──────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, search } = req.query
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id }

    if (status && status !== 'all') filter.status = status
    if (category && category !== 'all') filter.category = category
    if (priority && priority !== 'all') filter.priority = priority
    if (search) {
      const re = new RegExp(search, 'i')
      filter.$or = [{ title: re }, { description: re }, { location: re }]
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/complaints/:id ────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    if (req.user.role !== 'admin' && complaint.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' })

    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/complaints ───────────────────────────────────────────────────────
router.post('/', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body
    if (!title || !description || !category || !location)
      return res.status(400).json({ message: 'Title, description, category, and location are required' })

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : []

    const complaint = await Complaint.create({
      userId: req.user._id,
      studentName: req.user.name,
      rollNo: req.user.rollNo || 'N/A',
      department: req.user.department || 'N/A',
      title,
      description,
      category,
      priority: priority || 'medium',
      location,
      images,
    })
    res.status(201).json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/complaints/:id/status  (admin only) ───────────────────────────
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, assignedTo } = req.body
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    complaint.status = status

    if (status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date()
    }
    if (status !== 'resolved') {
      complaint.resolvedAt = null
    }

    if (assignedTo) {
      const admin = await User.findById(assignedTo)
      complaint.assignedTo = assignedTo
      complaint.assignedToName = admin?.name || null
    } else if (assignedTo === '') {
      complaint.assignedTo = null
      complaint.assignedToName = null
    }

    await complaint.save()
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/complaints/:id/comments ─────────────────────────────────────────
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' })

    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    if (req.user.role !== 'admin' && complaint.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' })

    const comment = {
      text: text.trim(),
      author: req.user.name,
      role: req.user.role,
      userId: req.user._id,
    }

    complaint.comments.push(comment)
    await complaint.save()

    const saved = complaint.comments[complaint.comments.length - 1]
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/complaints/:id ─────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

    if (req.user.role !== 'admin' && complaint.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' })

    // Delete uploaded images from disk
    complaint.images.forEach(img => {
      const filePath = path.join(__dirname, '..', img)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    })

    await complaint.deleteOne()
    res.json({ message: 'Complaint deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
