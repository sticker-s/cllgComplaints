require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Complaint = require('./models/Complaint')

const SAMPLE_USERS = [
  // ── Students ──────────────────────────────────────────────────────────────
  {
    name: 'Arjun Mehta',
    email: 'student1@campus.edu',
    password: 'student123',
    role: 'student',
    rollNo: 'CS2022001',
    department: 'Computer Science',
    year: '3rd Year',
  },
  {
    name: 'Priya Sharma',
    email: 'student2@campus.edu',
    password: 'student123',
    role: 'student',
    rollNo: 'EC2023045',
    department: 'Electronics',
    year: '2nd Year',
  },
  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    name: 'Dr. Rajesh Verma',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Complaint.deleteMany({})
    console.log('🧹 Cleared existing users and complaints')

    // Create users individually so pre('save') hook hashes passwords
    const users = []
    for (const u of SAMPLE_USERS) {
      const user = new User(u)
      await user.save()
      users.push(user)
      console.log(`👤 Created ${user.role}: ${user.email}`)
    }

    console.log('\n🎉 Seed complete!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  STUDENT 1  →  student1@campus.edu  /  student123')
    console.log('  STUDENT 2  →  student2@campus.edu  /  student123')
    console.log('  ADMIN      →  admin@campus.edu      /  admin123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()
