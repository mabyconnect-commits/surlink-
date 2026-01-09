# MongoDB vs Supabase Implementation Guide

## 📁 File Structure

### Using MongoDB (Original)
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          ✅ Use this
│   ├── controllers/
│   │   └── authController.js    ✅ Use this
│   ├── middleware/
│   │   └── auth.js               ✅ Use this
│   ├── models/                   ✅ Mongoose models
│   │   ├── User.js
│   │   ├── Booking.js
│   │   └── ...
│   └── server.js                 ✅ Use this
```

### Using Supabase (New)
```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          ✅ Use this
│   ├── controllers/
│   │   └── authController.supabase.js ✅ Use this (rename to authController.js)
│   ├── middleware/
│   │   └── auth.supabase.js      ✅ Use this (rename to auth.js)
│   ├── models/                   ❌ Not needed (SQL schema used)
│   └── server.supabase.js        ✅ Use this (rename to server.js)
├── supabase/
│   └── migrations/
│       └── initial_schema.sql    ✅ Run in Supabase Dashboard
```

## 🔄 How to Switch

### To Use Supabase:

1. **Rename Files:**
```bash
cd /home/user/surlink-/backend

# Backup originals
mv src/controllers/authController.js src/controllers/authController.mongo.js
mv src/middleware/auth.js src/middleware/auth.mongo.js
mv src/server.js src/server.mongo.js

# Activate Supabase versions
mv src/controllers/authController.supabase.js src/controllers/authController.js
mv src/middleware/auth.supabase.js src/middleware/auth.js
mv src/server.supabase.js src/server.js
```

2. **Update .env:**
```env
# Remove MongoDB
# MONGODB_URI=mongodb://localhost:27017/surlink

# Add Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

3. **Install Dependencies:**
```bash
npm install
```

4. **Run Migration:**
- Copy `supabase/migrations/initial_schema.sql`
- Paste in Supabase Dashboard → SQL Editor
- Click Run

5. **Start Server:**
```bash
npm run dev
```

### To Revert to MongoDB:

1. **Rename Files Back:**
```bash
# Restore originals
mv src/controllers/authController.js src/controllers/authController.supabase.js
mv src/middleware/auth.js src/middleware/auth.supabase.js
mv src/server.js src/server.supabase.js

mv src/controllers/authController.mongo.js src/controllers/authController.js
mv src/middleware/auth.mongo.js src/middleware/auth.js
mv src/server.mongo.js src/server.js
```

2. **Update .env:**
```env
MONGODB_URI=mongodb://localhost:27017/surlink
```

3. **Start MongoDB:**
```bash
mongod
```

4. **Start Server:**
```bash
npm run dev
```

## 🔍 Key Differences

### Database Queries

**MongoDB (Mongoose):**
```javascript
// Find user
const user = await User.findOne({ email });

// Create booking
const booking = await Booking.create({
  customerId,
  providerId,
  amount: 5000
});

// Update user
await User.findByIdAndUpdate(userId, { name: 'New Name' });

// Complex query
const providers = await User.find({
  role: 'provider',
  rating: { $gte: 4.0 }
}).sort({ rating: -1 }).limit(10);
```

**Supabase (PostgreSQL):**
```javascript
// Find user
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();

// Create booking
const { data: booking } = await supabase
  .from('bookings')
  .insert([{
    customer_id: customerId,
    provider_id: providerId,
    amount: 5000
  }])
  .select()
  .single();

// Update user
const { data } = await supabase
  .from('users')
  .update({ name: 'New Name' })
  .eq('id', userId);

// Complex query
const { data: providers } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'provider')
  .gte('rating', 4.0)
  .order('rating', { ascending: false })
  .limit(10);
```

### Field Naming

| MongoDB | Supabase | Notes |
|---------|----------|-------|
| `_id` | `id` | Primary key |
| `kycStatus` | `kyc_status` | Snake case |
| `referredBy` | `referred_by_id` | Foreign key |
| `walletBalance` | `wallet_balance` | Snake case |
| `createdAt` | `created_at` | Snake case |
| `location.coordinates` | `location` (GEOGRAPHY) | PostGIS type |

### Relationships

**MongoDB:**
```javascript
const booking = await Booking.findById(id)
  .populate('customer')
  .populate('provider')
  .populate('service');
```

**Supabase:**
```javascript
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    *,
    customer:customer_id(*),
    provider:provider_id(*),
    service:service_id(*)
  `)
  .eq('id', id)
  .single();
```

### Geolocation

**MongoDB (using 2dsphere):**
```javascript
const providers = await User.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 10000 // 10km in meters
    }
  }
});
```

**Supabase (using PostGIS):**
```sql
SELECT *,
  ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)::geography
  ) / 1000 as distance_km
FROM users
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(3.3792, 6.5244), 4326)::geography,
  10000
)
ORDER BY distance_km;
```

## 📊 Feature Comparison

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| **Database Type** | NoSQL (Document) | SQL (Relational) |
| **Schema** | Flexible | Fixed (migrations) |
| **Queries** | JavaScript API | SQL-like API |
| **Relationships** | References + Populate | Foreign Keys + Joins |
| **Geolocation** | 2dsphere indexes | PostGIS extension |
| **Real-time** | Change Streams | Built-in subscriptions |
| **Authentication** | Custom (JWT) | Built-in + Custom |
| **File Storage** | External (Cloudinary) | Built-in Storage |
| **Admin Panel** | External (MongoDB Compass) | Built-in Dashboard |
| **Triggers** | Middleware/Hooks | SQL Triggers |
| **Full-text Search** | Text indexes | pg_trgm extension |
| **Transactions** | Multi-doc transactions | ACID compliant |
| **Hosting** | Self-hosted / MongoDB Atlas | Fully managed |
| **Cost (Free Tier)** | 512MB | 500MB + extras |

## 💡 When to Use Each

### Use MongoDB if you need:
- ✅ Flexible schema that changes often
- ✅ Document-oriented data (JSON-like)
- ✅ Horizontal scaling
- ✅ Simple relationships
- ✅ Fast writes
- ✅ Existing MongoDB expertise

### Use Supabase if you need:
- ✅ Relational data with complex joins
- ✅ ACID transactions
- ✅ Built-in real-time features
- ✅ Integrated authentication
- ✅ File storage included
- ✅ SQL expertise
- ✅ Row-level security
- ✅ Auto-generated APIs

## 🎯 Recommendation for Surlink

**Supabase is recommended** because:

1. **Relational Data**: Bookings, Users, Services have clear relationships
2. **Geolocation**: PostGIS is more powerful than MongoDB's geo queries
3. **Real-time**: Built-in subscriptions perfect for messaging
4. **All-in-One**: Auth + Database + Storage + Real-time in one platform
5. **Dashboard**: Visual database management
6. **Cost**: Better free tier with more features
7. **Developer Experience**: Faster development with built-in features

## 🚀 Migration Path

If you want to migrate from MongoDB to Supabase:

1. **Export MongoDB Data:**
```bash
mongoexport --db surlink --collection users --out users.json
```

2. **Transform Data:**
```javascript
// Convert MongoDB docs to Supabase format
const transformUser = (mongoUser) => ({
  id: mongoUser._id,
  name: mongoUser.name,
  email: mongoUser.email,
  kyc_status: mongoUser.kycStatus,
  created_at: mongoUser.createdAt,
  // ... convert all fields
});
```

3. **Import to Supabase:**
```javascript
const { data, error } = await supabase
  .from('users')
  .insert(transformedUsers);
```

## 📝 Notes

- Both implementations are fully functional
- Choose based on your team's expertise and requirements
- Can run both simultaneously for gradual migration
- Test thoroughly before switching in production

---

**Current Status**: Both MongoDB and Supabase implementations are ready to use! 🎉
