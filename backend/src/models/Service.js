const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'cleaning',
      'hairdressing',
      'driving',
      'ac_repair',
      'gardening',
      'moving',
      'appliance_repair',
      'photography'
    ]
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  priceType: {
    type: String,
    enum: ['fixed', 'hourly', 'quote'],
    required: true
  },
  price: {
    type: Number,
    required: function() {
      return this.priceType !== 'quote';
    },
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  bookingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ provider: 1, category: 1 });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ provider: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
