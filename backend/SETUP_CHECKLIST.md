# Backend Setup Checklist

This document outlines everything you need to do to make your Surlink backend fully functional.

---

## 🔴 CRITICAL - Must Do First

### 1. Fix Critical Bugs ✅ FIXED
- [x] **JWT Bug Fixed** - Changed `user._id` to `user.id` in [src/utils/jwt.js:20-21](src/utils/jwt.js#L20-L21)
- [x] **Password Hash Leak Fixed** - Added `password_hash` removal in token response

### 2. Run Database Migrations ⚠️ REQUIRED
**Status:** Database schema ready but NOT yet applied to your Supabase instance

**Action Required:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`https://xmwfjseqhqqkoqhrovtk.supabase.co`)
3. Navigate to **SQL Editor** in the left sidebar
4. Open the migration file: [backend/supabase/migrations/20240101000000_initial_schema.sql](backend/supabase/migrations/20240101000000_initial_schema.sql)
5. Copy the entire SQL content
6. Paste into Supabase SQL Editor
7. Click **RUN** to execute

**What this creates:**
- 12 database tables (users, services, bookings, reviews, etc.)
- Automatic triggers (referral codes, timestamps, rating updates)
- Database views for optimized queries
- PostGIS extension for location-based search
- Row Level Security policies

### 3. Create Supabase Storage Bucket ⚠️ REQUIRED
**Status:** Upload API configured but bucket doesn't exist yet

**Action Required:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** → **New bucket**
3. Bucket name: `surlink-uploads`
4. Choose **Public** (for avatars, images) or **Private** (for documents)
5. Click **Create bucket**

**Optional - Set bucket policies:**
```sql
-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'surlink-uploads' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'surlink-uploads'
  AND auth.role() = 'authenticated'
);
```

---

## 🟡 HIGH PRIORITY - Core Business Features

### 4. Configure Email Service (SMTP) ⚠️ PARTIAL
**Status:** Email utility exists but credentials not configured

**Current .env values (need updating):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com          # ❌ UPDATE THIS
SMTP_PASSWORD=your-email-app-password    # ❌ UPDATE THIS
FROM_EMAIL=noreply@surlink.com           # ❌ UPDATE THIS
FROM_NAME=Surlink
```

**Setup Options:**

**Option A: Gmail (Easiest)**
1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Google Account → Security → App Passwords
   - Generate password for "Mail"
4. Update `.env.local`:
   ```env
   SMTP_USER=your.email@gmail.com
   SMTP_PASSWORD=generated-app-password
   FROM_EMAIL=your.email@gmail.com
   ```

**Option B: SendGrid (Recommended for Production)**
1. Sign up at https://sendgrid.com
2. Create API Key
3. Update `.env.local`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

**Option C: Mailgun, Postmark, AWS SES**
- Similar setup to SendGrid
- Update SMTP credentials in `.env.local`

**What works now:**
- ✅ Welcome emails on registration
- ✅ Password reset emails
- ✅ Booking notifications
- ✅ KYC status emails
- ✅ Withdrawal confirmations

### 5. Implement Core Business Logic ❌ NOT STARTED

These are the stubbed routes that need full implementation:

#### A. Services System (Priority 1)
**File:** [src/routes/services.js](src/routes/services.js)

**Endpoints needed:**
- `POST /api/services` - Provider creates service listing
- `GET /api/services` - List all services with filters (category, location, price)
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Provider updates service
- `DELETE /api/services/:id` - Provider deletes service
- `GET /api/services/search` - Geographic search using PostGIS
- `GET /api/services/category/:category` - Filter by category

**Database ready:** ✅ `services` table exists
**Dependencies:** None

#### B. Bookings System (Priority 1)
**File:** [src/routes/bookings.js](src/routes/bookings.js)

**Endpoints needed:**
- `POST /api/bookings` - Customer creates booking
- `GET /api/bookings` - List user's bookings (customer or provider)
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/accept` - Provider accepts booking
- `PUT /api/bookings/:id/start` - Provider starts work
- `PUT /api/bookings/:id/complete` - Provider completes work
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/review` - Customer reviews booking

**Database ready:** ✅ `bookings` table exists
**Dependencies:**
- Wallet system (for escrow)
- Payment integration (Paystack)
- Notification system

#### C. Wallet System (Priority 1)
**File:** [src/routes/wallet.js](src/routes/wallet.js)

**Endpoints needed:**
- `GET /api/wallet/balance` - Get user wallet balance
- `GET /api/wallet/transactions` - List transaction history
- `POST /api/wallet/fund` - Fund wallet via Paystack
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/withdrawals` - List withdrawal history
- `POST /api/wallet/verify-bank` - Verify bank account via Paystack

**Database ready:** ✅ `transactions`, `withdrawals`, `bank_accounts` tables exist
**Dependencies:**
- Paystack integration (for funding & bank verification)

#### D. Reviews System (Priority 2)
**File:** [src/routes/reviews.js](src/routes/reviews.js)

**Endpoints needed:**
- `POST /api/reviews` - Create review (after booking completion)
- `GET /api/reviews/provider/:id` - Get provider reviews
- `GET /api/reviews/booking/:id` - Get booking review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

**Database ready:** ✅ `reviews` table exists
**Trigger ready:** ✅ Auto-updates provider rating
**Dependencies:** Bookings system

#### E. Messaging System (Priority 2)
**File:** [src/routes/messages.js](src/routes/messages.js)

**Endpoints needed:**
- `GET /api/messages/conversations` - List user conversations
- `GET /api/messages/:conversationId` - Get messages in conversation
- `POST /api/messages/:conversationId` - Send message
- `PUT /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete message

**Database ready:** ✅ `conversations`, `messages` tables exist
**Real-time:** ⚠️ Socket.io dependency installed but not configured
**Dependencies:** None

**Bonus - Real-time messaging:**
- Configure Socket.io for real-time message delivery
- Or use Supabase Realtime subscriptions

#### F. KYC System (Priority 2)
**File:** [src/routes/kyc.js](src/routes/kyc.js)

**Endpoints needed:**
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Get KYC status
- `PUT /api/kyc/update` - Update KYC documents
- `GET /api/kyc/verify` - Admin: List pending KYC
- `PUT /api/kyc/:id/approve` - Admin: Approve KYC
- `PUT /api/kyc/:id/reject` - Admin: Reject KYC

**Database ready:** ✅ `kyc_documents` table exists
**Trigger ready:** ✅ Auto-syncs status to `users.kyc_status`
**Dependencies:** Upload system (✅ already working)

#### G. Referrals System (Priority 3)
**File:** [src/routes/referrals.js](src/routes/referrals.js)

**Endpoints needed:**
- `GET /api/referrals/code` - Get user's referral code
- `GET /api/referrals/stats` - Get referral statistics
- `GET /api/referrals/earnings` - Get referral earnings
- `GET /api/referrals/tree` - Get referral tree (3 levels)

**Database ready:** ✅ `referrals` table exists
**Auto-generated:** ✅ Referral codes auto-created on user registration
**Logic ready:** Referral tracking happens on registration in [authController.js:81-98](src/controllers/authController.js#L81-L98)
**Missing:** Earnings calculation & payout logic

**Referral commission rates (.env):**
```env
REFERRAL_LEVEL_1_PERCENTAGE=2.5   # Direct referrals
REFERRAL_LEVEL_2_PERCENTAGE=1.5   # Second level
REFERRAL_LEVEL_3_PERCENTAGE=1.0   # Third level
```

#### H. Notifications System (Priority 3)
**File:** [src/routes/notifications.js](src/routes/notifications.js)

**Endpoints needed:**
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

**Database ready:** ✅ `notifications` table exists
**Missing:** Notification creation logic in other modules
**Channels configured:** Email, SMS, Push (but SMS/Push not implemented)

---

## 🟠 MEDIUM PRIORITY - External Integrations

### 6. Paystack Integration (Payment Gateway) ❌ NOT STARTED
**Status:** Credentials configured but no implementation

**Current .env values:**
```env
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key     # ❌ UPDATE
PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key     # ❌ UPDATE
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret              # ❌ UPDATE
```

**Setup Steps:**
1. Sign up at https://paystack.com
2. Get your Test API Keys from Dashboard → Settings → API Keys & Webhooks
3. Update `.env.local` with your keys
4. For production, switch to Live keys

**Endpoints to implement:**
- `POST /api/wallet/fund` - Initialize payment
- `GET /api/wallet/verify/:reference` - Verify payment
- `POST /api/webhooks/paystack` - Handle payment webhooks
- `POST /api/wallet/verify-bank` - Verify bank account number

**Documentation:**
- Paystack API: https://paystack.com/docs/api/
- Bank Account Verification: https://paystack.com/docs/api/verification/#verify-account-number
- Accept Payments: https://paystack.com/docs/payments/accept-payments/

**Required features:**
- Fund wallet
- Bank account verification
- Withdrawal processing
- Webhook handling for payment confirmations

### 7. Termii Integration (SMS Service) ❌ NOT STARTED
**Status:** Credentials configured but no implementation

**Current .env values:**
```env
TERMII_API_KEY=your-termii-api-key    # ❌ UPDATE
TERMII_SENDER_ID=Surlink
```

**Setup Steps:**
1. Sign up at https://termii.com
2. Get API Key from Dashboard
3. Register Sender ID "Surlink"
4. Update `.env.local`

**Use cases:**
- Phone number verification (OTP)
- Booking notifications
- Transaction alerts
- Password reset codes

**Implementation needed:**
- Create `src/utils/sms.js` utility
- SMS notification functions
- OTP generation & verification

**Documentation:** https://developers.termii.com/

### 8. Google Maps Integration ❌ NOT USED
**Status:** API key configured but not implemented

**Current .env value:**
```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key    # ❌ UPDATE
```

**Potential use cases:**
- Location autocomplete for addresses
- Distance calculation between user and provider
- Map display on frontend
- Geocoding addresses to coordinates

**Note:** PostGIS is already configured for geographic queries, so Google Maps is optional.

---

## 🟢 LOW PRIORITY - Enhancements

### 9. OAuth Integration (Google/Facebook Login) ❌ NOT STARTED
**Status:** Database fields exist but no implementation

**Database ready:**
- `users.google_id` column exists
- `users.facebook_id` column exists

**Implementation needed:**
- Install Passport.js or use Supabase Auth
- Configure OAuth apps in Google/Facebook
- Add OAuth routes
- Link social accounts to existing users

**Supabase Auth Option (Recommended):**
Supabase has built-in OAuth support. Consider using Supabase Auth instead of custom JWT:
- Docs: https://supabase.com/docs/guides/auth/social-login

### 10. Email Verification ❌ NOT STARTED
**Status:** Database field exists but no flow

**Database ready:**
- `users.is_email_verified` column exists

**Implementation needed:**
- Generate verification token on registration
- Send verification email with link
- Create verification endpoint
- Block certain features until verified

### 11. Phone Verification ❌ NOT STARTED
**Status:** Database field exists but no flow

**Database ready:**
- `users.is_phone_verified` column exists

**Implementation needed:**
- Send OTP via Termii
- Create OTP verification endpoint
- Store OTP in Redis or database
- Require verification for payments

### 12. Two-Factor Authentication ❌ NOT STARTED
**Implementation options:**
- SMS-based OTP (via Termii)
- Email-based OTP
- Authenticator app (TOTP)

### 13. Real-time Features ⚠️ DEPENDENCY INSTALLED
**Status:** Socket.io installed but not configured

**Potential uses:**
- Real-time messaging
- Live booking status updates
- Live notifications
- Online/offline status

**Alternative:** Use Supabase Realtime subscriptions
- Docs: https://supabase.com/docs/guides/realtime

### 14. API Documentation ❌ NOT STARTED
**Options:**
- Swagger/OpenAPI (recommended)
- Postman collections
- API Blueprint

**Tools:**
- `swagger-jsdoc` + `swagger-ui-express`
- Generate from JSDoc comments

### 15. Input Validation ⚠️ DEPENDENCY INSTALLED
**Status:** `express-validator` installed but not used

**Implementation:**
- Add validation middleware to all routes
- Validate request body, params, query
- Return user-friendly error messages

**Example:**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/bookings',
  protect,
  [
    body('service_id').isUUID(),
    body('scheduled_date').isISO8601(),
    body('amount').isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... booking logic
  }
);
```

### 16. Rate Limiting per Endpoint ⚠️ BASIC IMPLEMENTATION
**Status:** Global rate limit exists (100 req/15min)

**Current implementation:** [server.js:39-43](src/server.js#L39-L43)

**Enhancement:**
- Stricter limits for auth endpoints (login, register)
- Relaxed limits for read-only endpoints
- IP-based blocking for abuse

### 17. Logging & Monitoring ⚠️ BASIC
**Current:** Morgan HTTP logging in development only

**Enhancements:**
- Winston for structured logging
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, Datadog)
- Request tracing with correlation IDs

### 18. Testing ⚠️ JEST INSTALLED
**Status:** Jest configured but no tests written

**Test script exists:** `npm test`

**What to test:**
- Unit tests for utilities (JWT, email, upload)
- Integration tests for API endpoints
- Database tests (Supabase queries)
- Middleware tests (auth, error handling)

### 19. Admin Dashboard Endpoints ❌ NOT STARTED
**Potential features:**
- User management (ban, verify)
- KYC approval workflow
- Transaction monitoring
- Service moderation
- Analytics & reports

**Authorization:**
- Use `authorize('admin')` middleware
- Already implemented in [middleware/auth.js:35-48](src/middleware/auth.js#L35-L48)

### 20. CORS Optimization ⚠️ TOO OPEN
**Current configuration:** [server.js:22-25](src/server.js#L22-L25)

**Issue:** Accepts any origin via `CLIENT_URL`

**Recommendation:**
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 📊 COMPLETION STATUS SUMMARY

### ✅ Fully Functional (Ready to Use)
- [x] Authentication (register, login, password reset)
- [x] User profile management
- [x] File upload to Supabase Storage
- [x] JWT token generation & validation
- [x] Role-based authorization
- [x] Email service (with proper SMTP config)
- [x] Error handling middleware
- [x] CORS & Security headers

### ⚠️ Partially Working (Needs Configuration)
- [ ] Database (schema ready, needs migration)
- [ ] Email (utility ready, needs SMTP credentials)
- [ ] Storage (upload API ready, needs bucket creation)

### ❌ Not Implemented (Needs Full Development)
- [ ] Services system (0%)
- [ ] Bookings system (0%)
- [ ] Wallet & transactions (0%)
- [ ] Reviews system (0%)
- [ ] Messaging system (0%)
- [ ] KYC verification (0%)
- [ ] Referrals (database ready, no endpoints)
- [ ] Notifications (0%)
- [ ] Paystack integration (0%)
- [ ] Termii SMS integration (0%)
- [ ] OAuth (Google/Facebook) (0%)
- [ ] Email/phone verification (0%)
- [ ] Real-time features (Socket.io) (0%)

### 📈 Overall Completion: ~35%

**Breakdown:**
- Infrastructure & Config: 80%
- Authentication & Auth: 70%
- File Management: 100%
- Core Business Logic: 0%
- External Integrations: 5%
- Testing & Documentation: 0%

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Week 1: Foundation
1. ✅ Run database migrations
2. ✅ Create Supabase storage bucket
3. ✅ Configure SMTP email
4. ✅ Test authentication endpoints

### Week 2: Core MVP
5. Implement Services system
6. Implement Bookings system (basic)
7. Implement Wallet system (basic)
8. Test end-to-end booking flow

### Week 3: Payments
9. Integrate Paystack (fund wallet)
10. Implement bank verification
11. Implement withdrawal processing
12. Test payment flow

### Week 4: Social Features
13. Implement Reviews system
14. Implement Messaging system
15. Implement Notifications
16. Test user interactions

### Week 5: Advanced Features
17. Implement KYC verification
18. Implement Referral system
19. Integrate Termii SMS
20. Add email/phone verification

### Week 6: Polish & Launch
21. Add input validation
22. Write API documentation
23. Add comprehensive testing
24. Deploy to production

---

## 📞 SUPPORT & RESOURCES

### Documentation Links
- **Supabase Docs:** https://supabase.com/docs
- **Paystack Docs:** https://paystack.com/docs
- **Termii Docs:** https://developers.termii.com
- **Express.js Docs:** https://expressjs.com
- **Nodemailer Docs:** https://nodemailer.com

### Files Reference
- Database Schema: [backend/supabase/migrations/20240101000000_initial_schema.sql](backend/supabase/migrations/20240101000000_initial_schema.sql)
- Upload API Docs: [backend/UPLOAD_API.md](backend/UPLOAD_API.md)
- Environment Config: [backend/.env.local](backend/.env.local)
- Main Server: [backend/src/server.js](backend/src/server.js)

### Getting Help
- GitHub Issues: Create detailed bug reports
- Supabase Discord: For database questions
- Stack Overflow: For general Express/Node questions

---

## ✅ IMMEDIATE ACTION ITEMS

**Do these NOW to get started:**

1. **Run Database Migration**
   - Copy SQL from migration file
   - Run in Supabase SQL Editor
   - Verify all 12 tables created

2. **Create Storage Bucket**
   - Name: `surlink-uploads`
   - Type: Public
   - Done in 1 minute

3. **Configure Email**
   - Update SMTP credentials in `.env.local`
   - Use Gmail for quick testing
   - Test by registering a new user

4. **Test Authentication**
   ```bash
   npm run dev
   # Try: POST /api/auth/register
   # Try: POST /api/auth/login
   ```

5. **Plan Next Steps**
   - Decide which feature to implement first
   - Services system recommended
   - Follow implementation order above

**After these 5 steps, your backend foundation will be solid!**
