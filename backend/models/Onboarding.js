const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  officialEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  temporaryPassword: {
    type: String,
    required: true
  },
  invitationSentAt: {
    type: Date,
    default: Date.now
  },
  invitationAcceptedAt: Date,
  detailsSubmittedAt: Date,
  status: {
    type: String,
    enum: ['invited', 'in-progress', 'submitted', 'approved', 'rejected'],
    default: 'invited'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewComments: {
    type: String,
    trim: true
  },
  documentsChecklist: {
    governmentId: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    },
    taxIdProof: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    },
    educationalCertificates: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    },
    experienceLetters: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    },
    offerLetter: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    },
    ndaSigned: { 
      submitted: { type: Boolean, default: false },
      verified: { type: Boolean, default: false }
    }
  },
  timeline: [{
    action: {
      type: String,
      enum: ['invited', 'reminder_sent', 'accessed', 'details_submitted', 'documents_uploaded', 'approved', 'rejected', 'comment_added']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  reminders: [{
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Invitation expires after 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Add to timeline when status changes
onboardingSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const action = this.status === 'approved' ? 'approved' : 
                  this.status === 'rejected' ? 'rejected' :
                  this.status === 'submitted' ? 'details_submitted' : null;
    
    if (action) {
      this.timeline.push({
        action,
        performedBy: this.reviewedBy || this.employee,
        details: this.reviewComments
      });
    }
  }
  next();
});

// Instance method to check if invitation is expired
onboardingSchema.methods.isExpired = function() {
  return this.expiresAt < new Date() && this.status === 'invited';
};

// Instance method to send reminder
onboardingSchema.methods.sendReminder = function(sentBy) {
  this.reminders.push({ sentBy });
  this.timeline.push({
    action: 'reminder_sent',
    performedBy: sentBy
  });
  return this.save();
};

module.exports = mongoose.model('Onboarding', onboardingSchema);
