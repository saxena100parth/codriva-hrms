const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
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
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
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
leaveSchema.pre('save', function(next) {
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

// Update employee leave balance when leave is approved
leaveSchema.post('save', async function(doc) {
  if (doc.status === 'approved' && !doc.wasApproved) {
    const Employee = mongoose.model('Employee');
    const employee = await Employee.findById(doc.employee);
    
    if (employee) {
      employee.leavesTaken[doc.leaveType] += doc.numberOfDays;
      await employee.save();
    }
  }
});

// Restore leave balance when approved leave is cancelled
leaveSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const oldDoc = await this.constructor.findById(this._id);
    if (oldDoc && oldDoc.status === 'approved' && this.status === 'cancelled') {
      const Employee = mongoose.model('Employee');
      const employee = await Employee.findById(this.employee);
      
      if (employee) {
        employee.leavesTaken[this.leaveType] -= this.numberOfDays;
        await employee.save();
      }
    }
    
    // Mark if it was just approved for post hook
    if (oldDoc && oldDoc.status !== 'approved' && this.status === 'approved') {
      this.wasApproved = true;
    }
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
