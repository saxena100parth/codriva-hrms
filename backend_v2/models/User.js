const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
  // Basic Auth Info
  email: {
    type: String,
    required: function () {
      // Email is required for ADMIN users or when status is ACTIVE
      // During onboarding (status: DRAFT, onboardingStatus: PENDING/SUBMITTED), email is optional
      if (this.role === 'ADMIN') return true;
      if (this.status === 'ACTIVE') return true;
      if (this.onboardingStatus === 'COMPLETED') return true;
      return false;
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function () {
      // Password is required for ADMIN users or when status is ACTIVE
      // During onboarding (status: DRAFT), password is optional until official email is assigned
      if (this.role === 'ADMIN') return true;
      if (this.status === 'ACTIVE') return true;
      if (this.onboardingStatus === 'COMPLETED') return true;
      return false;
    },
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['ADMIN', 'HR', 'EMPLOYEE'],
    default: 'EMPLOYEE'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'DRAFT'
  },

  // Personal Information
  fullName: {
    first: { type: String, trim: true, required: [true, 'Please provide first name'] },
    middle: { type: String, trim: true },
    last: { type: String, trim: true }
  },
  personalEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    required: [true, 'Please provide personal email']
  },
  mobileNumber: {
    type: String,
    trim: true,
    required: [true, 'Please provide mobile number']
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },

  // Employee Specific Fields (only for role: 'employee' or 'hr')
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  jobTitle: { type: String, trim: true },
  department: { type: String, trim: true, enum: ['TECH', 'HR', 'FINANCE', 'MARKETING', 'SALES', 'OTHER'] },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportingManagerName: { type: String, trim: true }, // Temporary field for onboarding
  employmentType: {
    type: String,
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'OTHER']
  },
  joiningDate: Date,

  // Address Information
  currentAddress: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  permanentAddress: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true }
  },

  // Banking & Tax Details
  bankAccountNumber: { type: String, trim: true },
  ifscSwiftRoutingCode: { type: String, trim: true },
  taxId: { type: String, trim: true },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true }
  },

  // Documents Upload
  documents: {
    governmentId: {
      type: { type: String, trim: true, enum: ['PAN', 'AADHAR', 'VOTER_ID', 'PASSPORT', 'OTHER'] },
      number: { type: String, trim: true },
      url: { type: String, trim: true }
    },
    taxIdProof: {
      type: { type: String, trim: true, enum: ['PAN', 'AADHAR', 'VOTER_ID', 'PASSPORT', 'OTHER'] },
      number: { type: String, trim: true },
      url: { type: String, trim: true }
    },
    educationalCertificates: [{
      type: { type: String, trim: true, enum: ['10TH', '12TH', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'OTHER'] },
      institution: { type: String, trim: true },
      period: { from: Date, to: Date },
      percentage: { type: Number },
      url: { type: String, trim: true }
    }],
    experienceLetters: [{
      company: { type: String, trim: true },
      period: { from: Date, to: Date },
      designation: { type: String, trim: true },
      reasonForLeaving: { type: String, trim: true },
      url: { type: String, trim: true }
    }],
  },

  // HR / Legal Compliance
  compliance: {
    offerLetter: { type: String },
    ndaSigned: { type: Boolean, default: false },
    pfOrSocialSecurityConsent: { type: Boolean, default: false }
  },

  // Leave Information
  leaveBalance: {
    annual: { type: Number, default: 1.5 },
    sick: { type: Number, default: 0 },
    personal: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 }
  },
  leavesTaken: {
    annual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    personal: { type: Number, default: 0 },
    maternity: { type: Number, default: 0 },
    paternity: { type: Number, default: 0 }
  },

  // Onboarding Status
  onboardingStatus: {
    type: String,
    enum: ['INVITED', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED'],
    default: 'INVITED'
  },
  onboardingSubmittedAt: Date,
  onboardingApprovedAt: Date,
  onboardingApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  onboardingRemarks: String,
  inviteExpiryTime: Date,
  invitationToken: String,
  otpCode: String,
  otpExpiresAt: Date,

  // Security fields
  passwordChangedAt: Date,
  hasTemporaryPassword: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate employee ID for employees/HR when onboarding is approved
userSchema.pre('save', async function (next) {
  if (
    !this.employeeId &&
    this.onboardingStatus === 'COMPLETED' &&
    (this.role === 'EMPLOYEE' || this.role === 'HR')
  ) {
    // Count users with onboardingStatus COMPLETED and role EMPLOYEE or HR
    const count = await this.constructor.countDocuments({
      onboardingStatus: 'COMPLETED',
      role: { $in: ['EMPLOYEE', 'HR'] }
    });
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
userSchema.virtual('displayName').get(function () {
  if (this.fullName && (this.fullName.first || this.fullName.last)) {
    const parts = [];
    if (this.fullName.first) parts.push(this.fullName.first);
    if (this.fullName.middle) parts.push(this.fullName.middle);
    if (this.fullName.last) parts.push(this.fullName.last);
    return parts.join(' ');
  }
  return 'N/A';
});

// Virtual for available leaves
userSchema.virtual('availableLeaves').get(function () {
  return {
    annual: this.leaveBalance.annual - this.leavesTaken.annual,
    sick: this.leaveBalance.sick - this.leavesTaken.sick,
    personal: this.leaveBalance.personal - this.leavesTaken.personal,
    maternity: this.leaveBalance.maternity - this.leavesTaken.maternity,
    paternity: this.leaveBalance.paternity - this.leavesTaken.paternity
  };
});

// Account locking methods
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
  virtuals: true
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ onboardingStatus: 1 });

module.exports = mongoose.model('User', userSchema);
