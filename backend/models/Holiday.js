const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Holiday date is required']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isOptional: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

holidaySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);


