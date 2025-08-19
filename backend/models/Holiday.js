const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide holiday name'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide holiday date']
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['national', 'regional', 'optional', 'company'],
    default: 'national'
  },
  description: {
    type: String,
    trim: true
  },
  isOptional: {
    type: Boolean,
    default: false
  },
  applicableFor: {
    type: [String],
    enum: ['all', 'full-time', 'intern', 'contractor'],
    default: ['all']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Extract year from date before saving
holidaySchema.pre('save', function(next) {
  if (this.date) {
    this.year = new Date(this.date).getFullYear();
  }
  next();
});

// Compound index to ensure unique holiday names per year
holidaySchema.index({ name: 1, year: 1 }, { unique: true });
holidaySchema.index({ date: 1 });
holidaySchema.index({ year: 1 });

// Static method to get holidays for a specific year
holidaySchema.statics.getHolidaysByYear = function(year) {
  return this.find({ year }).sort({ date: 1 });
};

// Static method to check if a date is a holiday
holidaySchema.statics.isHoliday = async function(date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const holiday = await this.findOne({
    date: {
      $gte: checkDate,
      $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
    }
  });
  
  return !!holiday;
};

module.exports = mongoose.model('Holiday', holidaySchema);
