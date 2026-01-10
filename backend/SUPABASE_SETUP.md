# Surlink Backend - Supabase Setup Guide

> Complete guide to set up and run the Surlink backend with Supabase (PostgreSQL)

## 🎯 What is Supabase?

**Supabase** is an open-source Firebase alternative built on PostgreSQL. It provides:

- ✅ **PostgreSQL Database** - Powerful relational database
- ✅ **Auto-generated REST API** - Instant APIs from your schema
- ✅ **Built-in Authentication** - User management out of the box
- ✅ **Real-time Subscriptions** - Live data updates
- ✅ **Storage** - File and image storage
- ✅ **Row Level Security (RLS)** - Fine-grained access control
- ✅ **PostGIS** - Geospatial queries for location features

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (free tier available)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: `surlink` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users (e.g., West US, EU West)
   - **Pricing Plan**: Free tier is sufficient to start

5. Wait for project to be provisioned (~2 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (starts with eyJ)
   - **service_role key**: `eyJhbG...` (starts with eyJ, keep this secret!)

### Step 3: Run Database Migration

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/backend/supabase/migrations/20240101000000_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`

You should see: `Surlink database schema created successfully!`

This creates:
- ✅ 12 database tables
- ✅ Indexes for fast queries
- ✅ Triggers for automation
- ✅ Functions for business logic
- ✅ Views for common queries
- ✅ Row Level Security policies

### Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Supabase credentials
nano .env
```

Update these values in `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Supabase connected successfully
📍 Project URL: https://xxxxx.supabase.co
🚀 Server running in development mode on port 5000
```

### Step 7: Test the API

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "password": "password123",
    "role": "customer"
  }'
```

## 📊 Database Structure

### Tables Created

| Table | Description | Key Features |
|-------|-------------|--------------|
| `users` | User accounts | Geolocation, wallet, referrals, KYC status |
| `services` | Provider services | 12 categories, pricing types |
| `bookings` | Service bookings | Status tracking, escrow, timeline |
| `reviews` | Customer reviews | Ratings, verified badges |
| `conversations` | Chat conversations | Unread counts, participants |
| `messages` | Chat messages | Real-time, attachments |
| `transactions` | Wallet transactions | All payment history |
| `kyc_documents` | KYC verification | Documents, bank details |
| `bank_accounts` | User bank accounts | Multiple accounts, verification |
| `withdrawals` | Withdrawal requests | Processing status |
| `notifications` | User notifications | Multi-channel support |
| `referrals` | Referral tracking | 3-level system |

### Key Features

**Geolocation (PostGIS)**
```sql
-- Find providers within 10km
SELECT * FROM users
WHERE role = 'provider'
AND ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)::geography,
  10000 -- 10km in meters
);
```

**Auto-generated Referral Codes**
- Unique 8-character codes (e.g., `ABC12345`)
- Automatically generated on user creation
- Used for 3-level referral tracking

**Platform Fee Calculation**
- Automatically calculates 15% platform fee
- Triggers on booking creation/update
- Updates `platform_fee` and `net_amount` fields

**Provider Rating Updates**
- Automatically updates when reviews are added
- Calculates average rating and count
- Triggers on review insert

**Conversation Updates**
- Auto-updates last message on new messages
- Maintains unread counts
- Triggers on message insert

## 🔐 Authentication Options

### Option 1: Custom JWT (Current Implementation)

**Pros:**
- Full control over auth logic
- Works with existing frontend
- Custom user fields

**Cons:**
- Manual implementation
- No built-in OAuth

**Usage:**
```javascript
// Login returns JWT token
const res = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const { token } = await res.json();

// Use token in requests
fetch('/api/bookings', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Option 2: Supabase Auth (Alternative)

**Pros:**
- Built-in OAuth (Google, Facebook, GitHub)
- Email verification
- Magic links
- Phone auth with SMS

**Cons:**
- Requires frontend changes
- Less customization

**To Enable:**
1. Go to **Authentication** → **Providers**
2. Enable desired providers (Email, Google, etc.)
3. Update frontend to use Supabase auth

## 💾 Storage Setup (File Uploads)

### Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Name: `surlink-uploads`
4. Make it **Public** (for avatars) or **Private** (for KYC documents)
5. Click **Create Bucket**

### Create Folders

Inside `surlink-uploads` bucket, create folders:
- `avatars/` - User profile pictures
- `kyc-documents/` - KYC verification documents
- `portfolio/` - Provider portfolio images
- `chat-attachments/` - Message attachments

### Storage Policies

Set up access policies:

```sql
-- Allow authenticated users to upload their avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'surlink-uploads' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public read access to avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'surlink-uploads' AND (storage.foldername(name))[1] = 'avatars');
```

### Upload Files (Backend)

```javascript
const { supabase } = require('./config/supabase');

// Upload avatar
const file = req.file;
const fileName = `avatars/${userId}/${Date.now()}-${file.originalname}`;

const { data, error } = await supabase.storage
  .from('surlink-uploads')
  .upload(fileName, file.buffer, {
    contentType: file.mimetype,
    upsert: true
  });

if (!error) {
  const { data: { publicUrl } } = supabase.storage
    .from('surlink-uploads')
    .getPublicUrl(fileName);

  // Update user avatar
  await supabase
    .from('users')
    .update({ avatar: publicUrl })
    .eq('id', userId);
}
```

## 🔍 Supabase Dashboard Features

### SQL Editor
- Write and run custom queries
- Save frequently used queries
- View query execution plans

### Table Editor
- View and edit data directly
- Apply filters and sorting
- Export to CSV

### Database
- View table structures
- Manage indexes
- Monitor performance

### API Docs
- Auto-generated API documentation
- Example requests for all tables
- Try API calls directly

### Logs
- View API logs
- Database queries
- Error tracking

### Extensions
- Enable PostGIS for geolocation
- pg_cron for scheduled jobs
- Full-text search (pg_trgm)

## 📡 Real-time Subscriptions

Enable real-time for messaging:

```javascript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update UI with new message
    }
  )
  .subscribe();

// Unsubscribe when done
subscription.unsubscribe();
```

## 🔒 Row Level Security (RLS)

RLS is enabled on all tables. Current policies:

**Users:**
- Users can read/update their own data
- Public can view provider profiles

**Services:**
- Public can view all services
- Providers can create/update their own services

**Bookings:**
- Users can view their own bookings (as customer or provider)
- Users can update their own bookings

**Transactions:**
- Users can only view their own transactions

**Notifications:**
- Users can only view/update their own notifications

### Custom RLS Policies

Add custom policies in SQL Editor:

```sql
-- Allow customers to create bookings
CREATE POLICY "Customers can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = customer_id AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'customer'
  )
);
```

## 🛠️ Common Queries

### Get Providers Near Location

```sql
SELECT
  id,
  name,
  avatar,
  rating,
  ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)::geography
  ) / 1000 as distance_km
FROM users
WHERE role = 'provider'
  AND kyc_status = 'verified'
  AND ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)::geography,
    10000 -- 10km
  )
ORDER BY distance_km
LIMIT 10;
```

### Get Provider with Stats

```sql
SELECT
  u.*,
  COUNT(DISTINCT s.id) as active_services,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.id) as review_count
FROM users u
LEFT JOIN services s ON s.provider_id = u.id AND s.is_active = true
LEFT JOIN bookings b ON b.provider_id = u.id
LEFT JOIN reviews r ON r.provider_id = u.id
WHERE u.id = 'provider-uuid-here'
GROUP BY u.id;
```

### Get User's Referral Stats

```sql
SELECT
  u.referral_code,
  COUNT(DISTINCT r.id) FILTER (WHERE r.level = 1) as level1_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.level = 2) as level2_count,
  COUNT(DISTINCT r.id) FILTER (WHERE r.level = 3) as level3_count,
  SUM(r.total_earnings) as total_referral_earnings
FROM users u
LEFT JOIN referrals r ON r.referrer_id = u.id
WHERE u.id = 'user-uuid-here'
GROUP BY u.id, u.referral_code;
```

## 🚨 Troubleshooting

### Connection Issues

```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/
```

If fails:
1. Check SUPABASE_URL in .env
2. Verify project is not paused (free tier pauses after 1 week inactivity)
3. Check network/firewall

### Authentication Errors

```
Error: User no longer exists
```

**Fix:**
- Check JWT_SECRET matches between sessions
- Verify token hasn't expired
- Ensure user ID exists in database

### RLS Policy Errors

```
Error: new row violates row-level security policy
```

**Fix:**
- Check RLS policies in Supabase Dashboard
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- Re-enable after fixing policies

### Migration Errors

```
Error: relation "users" already exists
```

**Fix:**
- Drop all tables and re-run migration:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```

## 📈 Performance Optimization

### Indexes

All common queries have indexes:
- User lookup by email/phone
- Booking queries by customer/provider
- Location-based searches (GIST index)
- Transaction history by user

### Connection Pooling

Supabase handles connection pooling automatically. For high-traffic:

1. Go to **Settings** → **Database**
2. Note **Connection pooling** settings
3. Use pooled connection string for APIs

### Caching

Implement caching for frequently accessed data:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache provider profiles
const cacheKey = `provider_${providerId}`;
let provider = cache.get(cacheKey);

if (!provider) {
  const { data } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('id', providerId)
    .single();

  provider = data;
  cache.set(cacheKey, provider);
}
```

## 🔄 Backups

Supabase Pro/Team plans include:
- Automated daily backups
- Point-in-time recovery
- Manual backup downloads

**Free tier:**
- No automated backups
- Export data manually via Dashboard
- Use `pg_dump` for backups

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase
- **Status Page**: https://status.supabase.com

---

## ✅ Setup Checklist

- [ ] Created Supabase project
- [ ] Copied API credentials to `.env`
- [ ] Ran database migration
- [ ] Installed npm dependencies
- [ ] Started server successfully
- [ ] Tested API endpoints
- [ ] Created storage bucket
- [ ] Configured RLS policies
- [ ] Set up real-time subscriptions (optional)
- [ ] Enabled OAuth providers (optional)

---

**Ready to build! 🚀**

Your Supabase backend is now fully configured and ready for development.
