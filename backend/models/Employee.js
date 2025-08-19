const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Personal Information
  fullName: {
    first: { type: String, trim: true },
    middle: { type: String, trim: true },
    last: { type: String, trim: true }
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  personalEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  
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
  
  // Employment Details
  joiningDate: Date,
  jobTitle: { type: String, trim: true },
  department: { type: String, trim: true },
  reportingManager: { type: String, trim: true },
  employmentType: {
    type: String,
    enum: ['full-time', 'intern', 'contractor', '']
  },
  
  // Official Details
  officialEmail: {
    type: String,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  // Banking & Tax Details
  bankAccountNumber: { type: String, trim: true },
  ifscSwiftRoutingCode: { type: String, trim: true },
  taxId: { type: String, trim: true }, // PAN for India / SSN / etc.
  
  // Documents Upload (store file path or link)
  documents: {
    governmentId: { type: String },
    taxIdProof: { type: String },
    educationalCertificates: [{ type: String }],
    experienceLetters: [{ type: String }]
  },
  
  // HR / Legal Compliance
  compliance: {
    offerLetter: { type: String },
    ndaSigned: { type: Boolean, default: false },
    pfOrSocialSecurityConsent: { type: Boolean, default: false }
  },
  
  // Leave Information
  leaveBalance: {
    annual: { type: Number, default: 21 },
    sick: { type: Number, default: 7 },
    personal: { type: Number, default: 5 },
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
    enum: ['pending', 'in-progress', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  onboardingSubmittedAt: Date,
  onboardingApprovedAt: Date,
  onboardingApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  onboardingRemarks: String
}, {
  timestamps: true
});

// Generate employee ID before saving
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId && this.onboardingStatus === 'approved') {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual for full name
employeeSchema.virtual('displayName').get(function() {
  const parts = [];
  if (this.fullName.first) parts.push(this.fullName.first);
  if (this.fullName.middle) parts.push(this.fullName.middle);
  if (this.fullName.last) parts.push(this.fullName.last);
  return parts.join(' ') || 'N/A';
});

// Virtual for available leaves
employeeSchema.virtual('availableLeaves').get(function() {
  return {
    annual: this.leaveBalance.annual - this.leavesTaken.annual,
    sick: this.leaveBalance.sick - this.leavesTaken.sick,
    personal: this.leaveBalance.personal - this.leavesTaken.personal,
    maternity: this.leaveBalance.maternity - this.leavesTaken.maternity,
    paternity: this.leaveBalance.paternity - this.leavesTaken.paternity
  };
});

// Ensure virtuals are included in JSON
employeeSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Employee', employeeSchema);
