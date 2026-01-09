const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    minlength: 10,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: true // Verified because it's from actual booking
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ provider: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ createdAt: -1 });

// Update provider rating after review is saved
reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  const provider = await User.findById(this.provider);
  if (provider) {
    await provider.updateRating();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
