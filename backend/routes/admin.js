const router = require('express').Router()
const Complaint = require('../models/Complaint')
const User = require('../models/User')
const { auth, adminOnly } = require('../middleware/auth')

// All admin routes require auth + admin role
router.use(auth, adminOnly)

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, rejected, urgent] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'in-progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.countDocuments({ status: 'rejected' }),
      Complaint.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } }),
    ])

    // Category breakdown via aggregation
    const catAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    const categoryBreakdown = {}
    catAgg.forEach(c => { categoryBreakdown[c._id] = c.count })

    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({ total, pending, inProgress, resolved, rejected, urgent, categoryBreakdown, recentComplaints })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/admin/admins ─────────────────────────────────────────────────────
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password')
    res.json(admins)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
