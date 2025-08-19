const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Admin', 'Other'],
    required: [true, 'Please select a category']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'cancelled'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolution: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    this.ticketNumber = `TKT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add indexes for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ employee: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
