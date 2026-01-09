const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required']
  },
  bankCode: {
    type: String
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Account number must be 10 digits'
    }
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
bankAccountSchema.index({ user: 1 });
bankAccountSchema.index({ user: 1, isDefault: 1 });

// Ensure only one default account per user
bankAccountSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('BankAccount').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
