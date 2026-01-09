const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_new',
      'booking_accepted',
      'booking_cancelled',
      'booking_completed',
      'message_new',
      'payment_received',
      'payment_sent',
      'review_new',
      'referral_earned',
      'kyc_status',
      'withdrawal_completed',
      'promotion'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms']
  }],
  sentChannels: [{
    channel: String,
    sentAt: Date,
    success: Boolean,
    error: String
  }]
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
