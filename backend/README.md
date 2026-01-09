# Surlink Backend API

> Backend API for Surlink - Nigeria's Trusted Service Marketplace Platform

**Database**: Supabase (PostgreSQL)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your Supabase credentials

# Start development server
npm run dev

# Start production server
npm start
```

### Supabase Setup

**See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup guide.**

Quick steps:
1. Create project at [supabase.com](https://supabase.com)
2. Copy API credentials to `.env`
3. Run SQL migration from `supabase/migrations/initial_schema.sql` in Supabase Dashboard
4. Start server with `npm run dev`

## 💾 Database

**Supabase (PostgreSQL)** with:
- ✅ 12 relational tables
- ✅ PostGIS for geolocation
- ✅ Built-in real-time
- ✅ File storage
- ✅ Row Level Security
- ✅ Auto-generated APIs

### Tables

1. **users** - User accounts with wallet, KYC, referrals
2. **services** - Provider services (12 categories)
3. **bookings** - Service bookings with escrow
4. **reviews** - Ratings and reviews
5. **conversations** - Chat conversations
6. **messages** - Chat messages
7. **transactions** - Wallet transactions
8. **kyc_documents** - Provider verification
9. **bank_accounts** - User bank details
10. **withdrawals** - Withdrawal requests
11. **notifications** - User notifications
12. **referrals** - 3-level referral system

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js      # Supabase client
│   ├── controllers/
│   │   └── authController.js # Auth logic
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── error.js          # Error handling
│   ├── routes/               # API routes
│   ├── utils/
│   │   ├── jwt.js            # JWT utilities
│   │   ├── email.js          # Email service
│   │   └── upload.js         # Supabase storage
│   └── server.js             # Express server
├── supabase/
│   └── migrations/
│       └── initial_schema.sql # Database schema
├── .env.example
├── package.json
├── README.md                  # This file
└── SUPABASE_SETUP.md          # Detailed setup guide
```

## 🔐 Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

## 📡 API Endpoints

### Base URL

```
Development: http://localhost:5000/api
Production: https://api.surlink.com/api
```

---

## 1. Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "password123",
  "role": "customer",
  "referralCode": "ABC12345"
}
```

### Login
```http
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>

{
  "name": "John Updated",
  "bio": "Professional plumber",
  "services": ["plumbing", "ac_repair"]
}
```

### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <token>

{
  "oldPassword": "old123",
  "newPassword": "new456"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password

{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /api/auth/reset-password/:resetToken

{
  "password": "newpassword123"
}
```

### Update Settings
```http
PUT /api/auth/settings
Authorization: Bearer <token>

{
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "theme": "light"
}
```

---

## 2. Services

```http
# Get all services
GET /api/services

# Create service (Provider)
POST /api/services
Authorization: Bearer <token>

# Get my services
GET /api/services/my-services
Authorization: Bearer <token>

# Update service
PUT /api/services/:id
Authorization: Bearer <token>

# Delete service
DELETE /api/services/:id
Authorization: Bearer <token>

# Toggle active status
PATCH /api/services/:id/toggle
Authorization: Bearer <token>
```

---

## 3. Bookings

```http
# Get my bookings
GET /api/bookings?status=pending
Authorization: Bearer <token>

# Create booking
POST /api/bookings
Authorization: Bearer <token>

# Get booking details
GET /api/bookings/:id
Authorization: Bearer <token>

# Accept booking (Provider)
PUT /api/bookings/:id/accept
Authorization: Bearer <token>

# Complete booking (Provider)
PUT /api/bookings/:id/complete
Authorization: Bearer <token>

# Cancel booking
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>
```

---

## 4. Reviews

```http
# Submit review
POST /api/reviews
Authorization: Bearer <token>

# Get provider reviews
GET /api/reviews/provider/:providerId

# Get my reviews
GET /api/reviews/my-reviews
Authorization: Bearer <token>
```

---

## 5. Messaging

```http
# Get conversations
GET /api/messages/conversations
Authorization: Bearer <token>

# Get messages
GET /api/messages/conversation/:id
Authorization: Bearer <token>

# Send message
POST /api/messages
Authorization: Bearer <token>

# Mark as read
PUT /api/messages/:id/read
Authorization: Bearer <token>
```

---

## 6. Wallet & Payments

```http
# Get wallet balance
GET /api/wallet/balance
Authorization: Bearer <token>

# Fund wallet
POST /api/wallet/fund
Authorization: Bearer <token>

# Withdraw funds
POST /api/wallet/withdraw
Authorization: Bearer <token>

# Get transactions
GET /api/wallet/transactions
Authorization: Bearer <token>

# Manage bank accounts
GET /api/wallet/bank-accounts
POST /api/wallet/bank-accounts
DELETE /api/wallet/bank-accounts/:id
Authorization: Bearer <token>
```

---

## 7. Referrals

```http
# Get referral stats
GET /api/referrals/stats
Authorization: Bearer <token>

# Get referral history
GET /api/referrals/history
Authorization: Bearer <token>

# Get earnings
GET /api/referrals/earnings
Authorization: Bearer <token>
```

---

## 8. KYC Verification

```http
# Submit KYC
POST /api/kyc/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Get KYC status
GET /api/kyc/status
Authorization: Bearer <token>

# Update KYC
PUT /api/kyc/update
Authorization: Bearer <token>
```

---

## 9. Notifications

```http
# Get notifications
GET /api/notifications
Authorization: Bearer <token>

# Mark as read
PUT /api/notifications/:id/read
Authorization: Bearer <token>

# Mark all as read
PUT /api/notifications/read-all
Authorization: Bearer <token>

# Delete notification
DELETE /api/notifications/:id
Authorization: Bearer <token>

# Get unread count
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

---

## 10. Users & Search

```http
# Get providers
GET /api/users/providers

# Get provider profile
GET /api/users/providers/:id

# Search providers
GET /api/users/search?q=plumber&location=6.5244,3.3792&maxDistance=10

# Provider dashboard
GET /api/users/provider/dashboard
Authorization: Bearer <token>

# Customer dashboard
GET /api/users/customer/dashboard
Authorization: Bearer <token>
```

---

## 🔧 Platform Configuration

### Constants

- **Platform Fee:** 15%
- **Referral Commission:**
  - Level 1: 2.5%
  - Level 2: 1.5%
  - Level 3: 1.0%
- **Min Withdrawal:** NGN 5,000
- **Min Funding:** NGN 1,000
- **Max File Size:** 5MB

### Service Categories

1. Plumbing
2. Electrical
3. Carpentry
4. Painting
5. Cleaning
6. Hairdressing
7. Driving
8. AC Repair
9. Gardening
10. Moving
11. Appliance Repair
12. Photography

---

## 🔒 Security

- JWT authentication
- bcrypt password hashing
- Rate limiting (100 req/15min)
- Helmet security headers
- CORS protection
- Input validation
- Row Level Security (RLS)
- SQL injection prevention

---

## 📦 File Storage

**Supabase Storage** for:
- User avatars (`avatars/`)
- KYC documents (`kyc-documents/`)
- Provider portfolios (`portfolio/`)
- Chat attachments (`chat-attachments/`)

### Upload Example

```javascript
const { uploadToSupabase } = require('./utils/upload');

// Upload avatar
const result = await uploadToSupabase(
  req.file,
  'avatars',
  req.user.id
);

if (result.success) {
  // Update user avatar URL
  await supabase
    .from('users')
    .update({ avatar: result.url })
    .eq('id', req.user.id);
}
```

---

## 🚨 Error Responses

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {}
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📝 Environment Variables

See `.env.example` for all required variables:

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxx

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

---

## 📖 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **SQL Migration** - `supabase/migrations/initial_schema.sql`
- **API Docs** - This file
- **Supabase Dashboard** - Auto-generated API docs

---

## 🚀 Deployment

### Deploy to Vercel/Netlify

```bash
# Install dependencies
npm install

# Set environment variables in dashboard

# Deploy
vercel deploy
```

### Deploy to Railway/Render

- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join community for help

---

## 📄 License

MIT License - Copyright (c) 2024 Surlink

---

Built with ❤️ by the Surlink Team using Supabase
