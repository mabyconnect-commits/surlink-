const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
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
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  cancelReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  acceptedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  },
  hasReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ location: '2dsphere' });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Calculate platform fee before saving
bookingSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 15;
    this.platformFee = (this.amount * feePercentage) / 100;
    this.netAmount = this.amount - this.platformFee;
  }
  next();
});

// Add timeline entry when status changes
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && this.isModified('timeline')) {
    const timelineEntry = {
      status: this.status,
      timestamp: new Date()
    };

    if (this.status === 'accepted') {
      this.acceptedAt = new Date();
    } else if (this.status === 'in_progress') {
      this.startedAt = new Date();
    } else if (this.status === 'completed') {
      this.completedAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }

    this.timeline.push(timelineEntry);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
