# 📚 Surlink API Documentation

## Base URL
```
Local: http://localhost:5000
Production: https://your-backend.railway.app
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "SecurePass123!",
  "role": "customer",
  "referral_code": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "referral_code": "EXNZ3G4U"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Updated",
  "bio": "Professional service provider",
  "address": "123 Main St, Lagos",
  "state": "Lagos",
  "lga": "Ikeja"
}
```

### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
PUT /api/auth/reset-password/:resetToken
```

**Body:**
```json
{
  "password": "NewPassword123!"
}
```

---

## 🛠️ Services Endpoints

### List All Services
```http
GET /api/services?category=plumbing&price_min=5000&price_max=20000&page=1&limit=20
```

**Query Parameters:**
- `category` - Filter by category
- `provider_id` - Filter by provider
- `price_min` - Minimum price
- `price_max` - Maximum price
- `search` - Search in title/description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [
    {
      "id": "uuid",
      "title": "Professional Plumbing Services",
      "description": "Expert plumber with 10 years experience",
      "category": "plumbing",
      "price_type": "hourly",
      "price": 5000,
      "duration": "1-2 hours",
      "images": ["url1", "url2"],
      "provider": {
        "id": "uuid",
        "name": "Provider Name",
        "avatar": "url",
        "rating": 4.5,
        "review_count": 25
      }
    }
  ]
}
```

### Get Single Service
```http
GET /api/services/:id
```

### Get Services by Category
```http
GET /api/services/category/plumbing?page=1&limit=20
```

**Categories:**
- plumbing
- electrical
- carpentry
- painting
- cleaning
- hairdressing
- driving
- ac_repair
- gardening
- moving
- appliance_repair
- photography

### Create Service (Provider Only)
```http
POST /api/services
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "plumbing",
  "title": "Professional Plumbing Services",
  "description": "Expert plumber with 10 years experience...",
  "price_type": "hourly",
  "price": 5000,
  "duration": "1-2 hours",
  "images": ["image-url-1", "image-url-2"]
}
```

**Price Types:**
- `fixed` - Fixed price
- `hourly` - Hourly rate
- `quote` - Contact for quote

### Update Service (Provider Only)
```http
PUT /api/services/:id
Authorization: Bearer <token>
```

### Delete Service (Provider Only)
```http
DELETE /api/services/:id
Authorization: Bearer <token>
```

---

## 📅 Bookings Endpoints

### List User Bookings
```http
GET /api/bookings?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (pending, accepted, in_progress, completed, cancelled)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "service": {
        "title": "Plumbing Service",
        "category": "plumbing"
      },
      "provider": {
        "name": "Provider Name",
        "phone": "08012345678"
      },
      "customer": {
        "name": "Customer Name",
        "phone": "08087654321"
      },
      "scheduled_date": "2026-01-15",
      "scheduled_time": "14:00",
      "amount": 10000,
      "platform_fee": 1500,
      "net_amount": 8500,
      "status": "pending",
      "location_address": "123 Main St, Lagos",
      "timeline": [...]
    }
  ]
}
```

### Get Single Booking
```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

### Create Booking (Customer)
```http
POST /api/bookings
Authorization: Bearer <token>
```

**Body:**
```json
{
  "service_id": "service-uuid",
  "scheduled_date": "2026-01-15",
  "scheduled_time": "14:00",
  "description": "Need to fix leaking pipe in kitchen",
  "location_address": "123 Main St, Ikeja, Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

### Accept Booking (Provider)
```http
PUT /api/bookings/:id/accept
Authorization: Bearer <token>
```

### Start Booking (Provider)
```http
PUT /api/bookings/:id/start
Authorization: Bearer <token>
```

### Complete Booking (Provider)
```http
PUT /api/bookings/:id/complete
Authorization: Bearer <token>
```

### Cancel Booking
```http
PUT /api/bookings/:id/cancel
Authorization: Bearer <token>
```

**Body:**
```json
{
  "reason": "Customer not available"
}
```

---

## ⭐ Reviews Endpoints

### Get Provider Reviews
```http
GET /api/reviews/provider/:providerId?rating=5&page=1&limit=20
```

**Query Parameters:**
- `rating` - Filter by rating (1-5)
- `page` - Page number
- `limit` - Items per page

### Get Booking Review
```http
GET /api/reviews/booking/:bookingId
Authorization: Bearer <token>
```

### Get My Reviews
```http
GET /api/reviews/my-reviews?page=1&limit=20
Authorization: Bearer <token>
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
```

**Body:**
```json
{
  "booking_id": "booking-uuid",
  "rating": 5,
  "review": "Excellent service! Very professional and thorough."
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "rating": 4,
  "review": "Updated review text"
}
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

---

## 👥 Users/Providers Endpoints

### List All Providers
```http
GET /api/users/providers?category=plumbing&state=Lagos&min_rating=4&page=1
```

**Query Parameters:**
- `category` - Filter by service category
- `state` - Filter by state
- `lga` - Filter by LGA
- `min_rating` - Minimum rating
- `kyc_verified` - true/false
- `search` - Search by name/bio
- `page` - Page number
- `limit` - Items per page

### Get Provider Profile
```http
GET /api/users/providers/:id
```

**Response includes:**
- Provider details
- Active services
- Recent reviews

### Search Users
```http
GET /api/users/search?query=john&role=provider
Authorization: Bearer <token>
```

---

## 💰 Wallet Endpoints

### Get Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 50000,
    "pending": 10000,
    "escrow": 5000,
    "total_earnings": 100000,
    "total_spent": 45000
  }
}
```

### Get Transactions
```http
GET /api/wallet/transactions?type=credit&category=funding&page=1
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` - credit or debit
- `category` - payment, withdrawal, referral, service, refund, funding
- `status` - pending, completed, failed, cancelled
- `page` - Page number
- `limit` - Items per page

### Fund Wallet
```http
POST /api/wallet/fund
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Funding initiated",
  "data": {
    "transaction_id": "uuid",
    "reference": "FUND-123456789-ABC",
    "amount": 10000,
    "payment_url": "https://paystack.com/pay/..."
  }
}
```

### Request Withdrawal
```http
POST /api/wallet/withdraw
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 25000,
  "bank_account_id": "bank-account-uuid"
}
```

### Get Withdrawals
```http
GET /api/wallet/withdrawals?status=pending&page=1
Authorization: Bearer <token>
```

---

## 🏦 Bank Account Endpoints

### Add Bank Account
```http
POST /api/wallet/bank-account
Authorization: Bearer <token>
```

**Body:**
```json
{
  "bank_name": "Access Bank",
  "bank_code": "044",
  "account_number": "0123456789",
  "account_name": "John Doe"
}
```

### List Bank Accounts
```http
GET /api/wallet/bank-accounts
Authorization: Bearer <token>
```

### Set Default Bank Account
```http
PUT /api/wallet/bank-account/:id/default
Authorization: Bearer <token>
```

### Delete Bank Account
```http
DELETE /api/wallet/bank-account/:id
Authorization: Bearer <token>
```

---

## 📤 File Upload Endpoints

### Upload Single File
```http
POST /api/upload/single?folder=avatars
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload

**Allowed Types:**
- Images: JPEG, JPG, PNG
- Documents: PDF

**Max Size:** 5MB

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://supabase.co/storage/.../file.jpg",
    "path": "avatars/user123/timestamp-file.jpg",
    "fileName": "photo.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg"
  }
}
```

### Upload Multiple Files
```http
POST /api/upload/multiple?folder=services
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `files` - Multiple files (max 5)

### Delete File
```http
DELETE /api/upload
Authorization: Bearer <token>
```

**Body:**
```json
{
  "filePath": "avatars/user123/timestamp-file.jpg"
}
```

### Get Signed URL
```http
GET /api/upload/signed-url?filePath=private/document.pdf&expiresIn=3600
Authorization: Bearer <token>
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": []
}
```

---

## 🚫 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 413 | Payload Too Large - File too big |
| 415 | Unsupported Media Type - Invalid file type |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## 🔒 Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- Applies to all `/api/*` endpoints

---

## 🧪 Testing Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Surlink API is running with Supabase",
  "timestamp": "2026-01-10T00:00:00.000Z",
  "environment": "development",
  "database": "Supabase (PostgreSQL)"
}
```

---

## 📝 Notes

1. **Authentication:** Most endpoints require JWT token
2. **Pagination:** Default limit is 20 items per page
3. **File Upload:** Max 5MB per file, max 5 files at once
4. **Wallet:** Minimum withdrawal ₦5,000, minimum funding ₦1,000
5. **Reviews:** Only for completed bookings, one per booking
6. **Bookings:** Auto-calculates 15% platform fee
7. **Email:** Notifications sent for key events (if SMTP configured)

---

**🎉 Your API is fully documented and ready to use!**
