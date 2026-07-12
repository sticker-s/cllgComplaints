const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNo, department, year } = req.body
    if (!name || !email || !password || !rollNo)
      return res.status(400).json({ message: 'Name, email, password, and roll number are required' })

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, rollNo, department, year })
    const token = signToken(user)
    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken(user)
    res.json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json(req.user.toSafeObject ? req.user.toSafeObject() : req.user)
})

module.exports = router
