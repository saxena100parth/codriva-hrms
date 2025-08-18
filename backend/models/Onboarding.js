const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  data: {
    type: Object,
    default: {},
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted'],
    default: 'in_progress',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Onboarding', onboardingSchema);


