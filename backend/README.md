# Surlink Backend API

> Backend API for Surlink - Nigeria's Trusted Service Marketplace Platform

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Request handlers
│   │   └── authController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   └── error.js     # Error handling
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   ├── Message.js
│   │   ├── Transaction.js
│   │   ├── KYC.js
│   │   ├── BankAccount.js
│   │   ├── Withdrawal.js
│   │   ├── Notification.js
│   │   └── Referral.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   ├── messages.js
│   │   ├── wallet.js
│   │   ├── referrals.js
│   │   ├── kyc.js
│   │   └── notifications.js
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   │   ├── jwt.js       # JWT token generation
│   │   ├── email.js     # Email sending
│   │   └── upload.js    # File upload handling
│   └── server.js        # App entry point
├── uploads/             # Local file uploads
├── .env.example         # Environment template
├── package.json
└── README.md
```

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

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

## 1. Authentication & User Management

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "password123",
  "role": "customer", // or "provider"
  "referralCode": "ABC12345" // optional
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "referralCode": "XYZ78901"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "08012345678",
  "bio": "Professional plumber with 10 years experience",
  "address": "123 Main St, Lagos",
  "state": "Lagos",
  "services": ["plumbing", "ac_repair"], // providers only
  "experience": "10 years", // providers only
  "availability": {
    "workingDays": ["Monday", "Tuesday", "Wednesday"],
    "workingHours": { "start": "08:00", "end": "17:00" }
  }
}
```

### Change Password
```http
PUT /auth/password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /auth/reset-password/:resetToken
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

### Update Settings
```http
PUT /auth/settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "bookingUpdates": true,
    "messages": true,
    "promotions": false
  },
  "theme": "light",
  "language": "en"
}
```

---

## 2. KYC Verification

### Submit KYC
```http
POST /kyc/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- fullName
- phone
- dateOfBirth
- address
- state
- lga
- documentType (NIN/Voters Card/Drivers License/Passport)
- documentNumber
- documentFront (file)
- documentBack (file)
- services[] (array)
- experience
- bio
- profilePhoto (file)
- bankName
- accountNumber
- accountName

### Get KYC Status
```http
GET /kyc/status
Authorization: Bearer <token>
```

### Update KYC (Resubmit)
```http
PUT /kyc/update
Authorization: Bearer <token>
```

---

## 3. Services

### Create Service (Provider)
```http
POST /services
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "category": "plumbing",
  "title": "Residential Plumbing Services",
  "description": "Professional plumbing for homes and apartments",
  "priceType": "fixed", // or "hourly" or "quote"
  "price": 5000,
  "duration": "2-3 hours"
}
```

### Get All Services (Public)
```http
GET /services
```

**Query Parameters:**
- category
- priceType
- minPrice
- maxPrice

### Get Provider's Services
```http
GET /services/my-services
Authorization: Bearer <token>
```

### Update Service
```http
PUT /services/:id
Authorization: Bearer <token>
```

### Delete Service
```http
DELETE /services/:id
Authorization: Bearer <token>
```

### Toggle Service Status
```http
PATCH /services/:id/toggle
Authorization: Bearer <token>
```

---

## 4. Search & Discovery

### Search Services
```http
GET /services/search
```

**Query Parameters:**
- q (search query)
- category
- location (lat,lng)
- minPrice
- maxPrice
- minRating
- maxDistance (in km)
- availableToday
- verifiedOnly
- sort (rating, distance, price-low, price-high, reviews)
- page
- limit

**Example:**
```
GET /services/search?q=plumber&location=6.5244,3.3792&maxDistance=10&minRating=4&verifiedOnly=true&sort=rating
```

### Get Providers by Category
```http
GET /services/category/:category
```

### Get Provider Profile
```http
GET /users/providers/:id
```

**Response:**
```json
{
  "success": true,
  "provider": {
    "_id": "...",
    "name": "John Doe",
    "avatar": "https://...",
    "rating": 4.8,
    "reviewCount": 45,
    "completedJobs": 120,
    "responseTime": "Within 1 hour",
    "memberSince": "2023-01-15",
    "location": {...},
    "distance": "5.2 km",
    "bio": "...",
    "verified": true,
    "services": [...],
    "availability": {...},
    "reviews": [...]
  }
}
```

---

## 5. Bookings

### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "serviceId": "...",
  "providerId": "...",
  "scheduledDate": "2024-02-01",
  "scheduledTime": "10:00",
  "description": "Fix kitchen sink leak",
  "location": {
    "coordinates": [3.3792, 6.5244],
    "address": "123 Main St, Lagos"
  },
  "amount": 5000
}
```

### Get My Bookings
```http
GET /bookings
Authorization: Bearer <token>
```

**Query Parameters:**
- status (pending, accepted, in_progress, completed, cancelled)
- role (customer, provider)
- search
- page
- limit

### Get Booking Details
```http
GET /bookings/:id
Authorization: Bearer <token>
```

### Accept Booking (Provider)
```http
PUT /bookings/:id/accept
Authorization: Bearer <token>
```

### Start Job (Provider)
```http
PUT /bookings/:id/start
Authorization: Bearer <token>
```

### Complete Job (Provider)
```http
PUT /bookings/:id/complete
Authorization: Bearer <token>
```

### Cancel Booking
```http
PUT /bookings/:id/cancel
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cancelReason": "Reason for cancellation"
}
```

### Get Booking Statistics
```http
GET /bookings/stats
Authorization: Bearer <token>
```

---

## 6. Reviews & Ratings

### Submit Review
```http
POST /reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bookingId": "...",
  "providerId": "...",
  "rating": 5,
  "review": "Excellent service! Very professional and timely."
}
```

### Get Provider Reviews
```http
GET /reviews/provider/:providerId
```

**Query Parameters:**
- page
- limit
- minRating

### Get My Reviews (Provider)
```http
GET /reviews/my-reviews
Authorization: Bearer <token>
```

---

## 7. Messaging

### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer <token>
```

### Get Messages
```http
GET /messages/conversation/:conversationId
Authorization: Bearer <token>
```

**Query Parameters:**
- page
- limit

### Send Message
```http
POST /messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recipientId": "...",
  "text": "Hello, I'd like to book your service",
  "bookingId": "..." // optional
}
```

### Mark as Read
```http
PUT /messages/:messageId/read
Authorization: Bearer <token>
```

---

## 8. Wallet & Payments

### Get Wallet Balance
```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "balance": 15000,
    "pendingBalance": 5000, // providers only
    "escrowBalance": 3000, // customers only
    "totalEarnings": 50000,
    "totalSpent": 25000
  }
}
```

### Fund Wallet
```http
POST /wallet/fund
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized",
  "authorizationUrl": "https://paystack.com/...",
  "reference": "TXN-123456789"
}
```

### Verify Payment
```http
GET /wallet/verify/:reference
Authorization: Bearer <token>
```

### Withdraw Funds (Provider)
```http
POST /wallet/withdraw
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 20000,
  "bankAccountId": "..."
}
```

### Get Transactions
```http
GET /wallet/transactions
Authorization: Bearer <token>
```

**Query Parameters:**
- type (credit, debit)
- category (payment, withdrawal, referral, service, refund, funding)
- status (pending, completed, failed)
- startDate
- endDate
- page
- limit

### Manage Bank Accounts

#### Add Bank Account
```http
POST /wallet/bank-accounts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bankName": "GTBank",
  "accountNumber": "0123456789",
  "accountName": "John Doe",
  "isDefault": true
}
```

#### Get Bank Accounts
```http
GET /wallet/bank-accounts
Authorization: Bearer <token>
```

#### Delete Bank Account
```http
DELETE /wallet/bank-accounts/:id
Authorization: Bearer <token>
```

---

## 9. Referrals

### Get Referral Stats
```http
GET /referrals/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "referralCode": "ABC12345",
    "referralLink": "https://surlink.com/register?ref=ABC12345",
    "totalReferrals": 15,
    "activeReferrals": 12,
    "totalEarnings": 12500,
    "pendingEarnings": 2000,
    "level1Count": 8,
    "level2Count": 5,
    "level3Count": 2
  }
}
```

### Get Referral History
```http
GET /referrals/history
Authorization: Bearer <token>
```

**Query Parameters:**
- level (1, 2, 3)
- status (active, pending)
- page
- limit

### Get Referral Earnings
```http
GET /referrals/earnings
Authorization: Bearer <token>
```

---

## 10. Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

**Query Parameters:**
- isRead (true, false)
- type
- page
- limit

### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

---

## 11. Provider Dashboard

### Get Dashboard Stats
```http
GET /users/provider/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "earnings": {
      "total": 150000,
      "thisMonth": 45000,
      "pending": 12000
    },
    "jobs": {
      "completed": 85,
      "active": 3,
      "pending": 5
    },
    "rating": 4.7,
    "reviews": 42,
    "profileViews": 1250,
    "completionRate": 95,
    "responseTime": "Within 1 hour",
    "upcomingJobs": [...]
  }
}
```

### Get Earnings Report
```http
GET /users/provider/earnings
Authorization: Bearer <token>
```

**Query Parameters:**
- period (this_week, this_month, last_month, this_year, all_time)
- startDate
- endDate

---

## 12. Customer Dashboard

### Get Dashboard Stats
```http
GET /users/customer/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalBookings": 12,
    "completed": 8,
    "inProgress": 2,
    "totalSpent": 65000,
    "recentBookings": [...],
    "nearbyProviders": [...]
  }
}
```

---

## 🔧 Platform Configuration

### Constants

- **Platform Fee:** 15% of booking amount
- **Referral Commission:**
  - Level 1: 2.5%
  - Level 2: 1.5%
  - Level 3: 1.0%
- **Minimum Withdrawal:** NGN 5,000
- **Minimum Funding:** NGN 1,000
- **Max File Size:** 5MB
- **Supported Image Formats:** JPG, PNG

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

### Booking Statuses

- `pending` - Booking created, awaiting provider acceptance
- `accepted` - Provider accepted booking
- `in_progress` - Job is currently being performed
- `completed` - Job completed successfully
- `cancelled` - Booking was cancelled

### KYC Statuses

- `not_started` - User hasn't submitted KYC
- `pending` - KYC submitted, awaiting review
- `under_review` - KYC is being reviewed by admin
- `verified` - KYC approved
- `rejected` - KYC rejected

---

## 🔒 Security

- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS:** Configured for specific origins
- **Helmet:** Security headers
- **Input Validation:** express-validator
- **File Upload:** File type and size validation

---

## 📮 Webhooks

### Paystack Webhook
```http
POST /api/webhooks/paystack
```

Handles payment events:
- `charge.success` - Payment successful
- `transfer.success` - Withdrawal successful
- `transfer.failed` - Withdrawal failed

---

## 🚨 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {...} // validation errors (if applicable)
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

## 📊 Database Models

### Collections

1. **users** - User accounts (customers, providers, admins)
2. **services** - Services offered by providers
3. **bookings** - Service bookings
4. **reviews** - Customer reviews
5. **conversations** - Message conversations
6. **messages** - Chat messages
7. **transactions** - Wallet transactions
8. **kycs** - KYC verification documents
9. **bankaccounts** - User bank accounts
10. **withdrawals** - Withdrawal requests
11. **notifications** - User notifications
12. **referrals** - Referral relationships

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 📝 Development Notes

### Pending Implementation

The following features are partially implemented and need full controller logic:

- [ ] Advanced search with Elasticsearch
- [ ] Real-time messaging with Socket.io
- [ ] Payment gateway integration (Paystack)
- [ ] SMS notifications (Termii)
- [ ] Email templates
- [ ] File upload to Cloudinary
- [ ] Google Maps integration
- [ ] Bank account verification
- [ ] Admin dashboard endpoints
- [ ] Analytics and reporting
- [ ] Cron jobs for automated tasks

### Next Steps

1. Implement all controllers with full CRUD operations
2. Add comprehensive validation middleware
3. Set up Socket.io for real-time features
4. Integrate payment gateways
5. Add comprehensive tests
6. Set up CI/CD pipeline
7. Deploy to production

---

## 📞 Support

For support, email support@surlink.com or join our Slack channel.

---

## 📄 License

MIT License - Copyright (c) 2024 Surlink

---

Built with ❤️ by the Surlink Team
