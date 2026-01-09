const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending'
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  activatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
referralSchema.index({ referrer: 1, level: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referrer: 1, status: 1 });

// Ensure unique referral relationship
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);
