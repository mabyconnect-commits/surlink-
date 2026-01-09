const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  lga: {
    type: String,
    required: true
  },

  // Document Verification
  documentType: {
    type: String,
    enum: ['NIN', 'Voters Card', 'Drivers License', 'Passport'],
    required: true
  },
  documentNumber: {
    type: String,
    required: true
  },
  documentFront: {
    type: String,
    required: true
  },
  documentBack: {
    type: String
  },

  // Professional Information (for providers)
  services: [{
    type: String
  }],
  experience: {
    type: String
  },
  bio: {
    type: String
  },
  profilePhoto: {
    type: String
  },

  // Bank Information
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },

  // Verification Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
kycSchema.index({ user: 1 });
kycSchema.index({ status: 1 });

// Update user's KYC status when KYC is updated
kycSchema.post('save', async function() {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    kycStatus: this.status,
    kycDocument: this._id
  });
});

module.exports = mongoose.model('KYC', kycSchema);
