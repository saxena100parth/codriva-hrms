const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: { // Changed from employee to user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from Employee to User
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity'],
    required: [true, 'Please specify leave type']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  numberOfDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for leave'],
    trim: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  backupPerson: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String // File paths
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Validate end date is after start date
leaveSchema.pre('save', function (next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }

  // Calculate number of days if not provided
  if (!this.numberOfDays) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.numberOfDays = diffDays;
  }

  next();
});

// Update user leave balance when leave is approved
leaveSchema.post('save', async function (doc) {
  if (doc.status === 'approved' && !doc.wasApproved) {
    const User = mongoose.model('User'); // Changed from Employee to User
    const user = await User.findById(doc.user); // Changed from employee to user

    if (user) {
      user.leavesTaken[doc.leaveType] += doc.numberOfDays;
      await user.save();
    }
  }
});

// Restore leave balance when approved leave is cancelled
leaveSchema.pre('save', async function (next) {
  if (this.isModified('status')) {
    const oldDoc = await this.constructor.findById(this._id);
    if (oldDoc && oldDoc.status === 'APPROVED' && this.status === 'CANCELLED') {
      const User = mongoose.model('User'); // Changed from Employee to User
      const user = await User.findById(this.user); // Changed from employee to user

      if (user) {
        user.leavesTaken[this.leaveType] -= this.numberOfDays;
        await user.save();
      }
    }

    // Mark if it was just approved for post hook
    if (oldDoc && oldDoc.status !== 'APPROVED' && this.status === 'APPROVED') {
      this.wasApproved = true;
    }
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
