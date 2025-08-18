const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  type: {
    type: String,
    enum: ['sick', 'casual', 'earned', 'unpaid', 'other'],
    required: [true, 'Leave type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvalComment: {
    type: String,
    trim: true,
    default: ''
  },
  decisionAt: {
    type: Date,
    default: null
  },
  totalDays: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total days before save if not provided
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const msInDay = 1000 * 60 * 60 * 24;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    // Inclusive of both start and end dates
    this.totalDays = Math.max(0, Math.floor((end - start) / msInDay) + 1);
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);


