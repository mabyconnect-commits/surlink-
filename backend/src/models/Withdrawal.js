const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [5000, 'Minimum withdrawal amount is NGN 5,000']
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  reference: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  processingNote: {
    type: String
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  failureReason: {
    type: String
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  paymentGateway: {
    provider: String,
    reference: String,
    transferCode: String,
    metadata: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ reference: 1 });

// Generate unique reference
withdrawalSchema.pre('save', async function(next) {
  if (!this.reference) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.reference = `WTH-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
