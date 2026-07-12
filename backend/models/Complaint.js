const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: { type: String, required: true },
    rollNo: { type: String, default: 'N/A' },
    department: { type: String, default: 'N/A' },

    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Wi-Fi', 'Hostel', 'Maintenance', 'Canteen', 'Infrastructure', 'Library', 'Transport', 'Academic', 'Other'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    location: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedToName: { type: String, default: null },

    images: [{ type: String }],
    comments: [commentSchema],

    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// Index for faster filtering
complaintSchema.index({ userId: 1, status: 1 })
complaintSchema.index({ status: 1, priority: 1 })
complaintSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Complaint', complaintSchema)
