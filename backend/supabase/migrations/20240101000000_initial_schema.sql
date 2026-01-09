-- Supabase Database Schema for Surlink Platform
-- Run this migration to set up all tables, indexes, triggers, and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
    avatar TEXT,
    bio TEXT,
    address TEXT,
    state VARCHAR(100),
    lga VARCHAR(100),

    -- Geolocation (using PostGIS)
    location GEOGRAPHY(POINT, 4326),
    location_address TEXT,

    -- Provider-specific fields
    services TEXT[], -- Array of service categories
    experience TEXT,
    working_days TEXT[], -- Array of days
    working_hours_start TIME,
    working_hours_end TIME,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    response_time VARCHAR(50) DEFAULT 'N/A',

    -- KYC Status
    kyc_status VARCHAR(20) DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'under_review', 'verified', 'rejected')),

    -- Wallet
    wallet_balance DECIMAL(12,2) DEFAULT 0.00,
    wallet_pending_balance DECIMAL(12,2) DEFAULT 0.00,
    wallet_escrow_balance DECIMAL(12,2) DEFAULT 0.00,
    wallet_total_earnings DECIMAL(12,2) DEFAULT 0.00,
    wallet_total_spent DECIMAL(12,2) DEFAULT 0.00,

    -- Referral
    referral_code VARCHAR(10) UNIQUE NOT NULL,
    referred_by_id UUID REFERENCES users(id),
    referral_level INTEGER DEFAULT 0,

    -- Settings
    settings_notifications_email BOOLEAN DEFAULT true,
    settings_notifications_push BOOLEAN DEFAULT true,
    settings_notifications_sms BOOLEAN DEFAULT false,
    settings_notifications_booking_updates BOOLEAN DEFAULT true,
    settings_notifications_messages BOOLEAN DEFAULT true,
    settings_notifications_promotions BOOLEAN DEFAULT true,
    settings_theme VARCHAR(10) DEFAULT 'light' CHECK (settings_theme IN ('light', 'dark')),
    settings_language VARCHAR(5) DEFAULT 'en',
    settings_two_factor_enabled BOOLEAN DEFAULT false,

    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,

    -- OAuth
    google_id VARCHAR(255),
    facebook_id VARCHAR(255),

    -- Password reset
    reset_password_token VARCHAR(255),
    reset_password_expire TIMESTAMP,

    -- Email verification
    email_verification_token VARCHAR(255),
    email_verification_expire TIMESTAMP,

    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_role_kyc ON users(role, kyc_status);
CREATE INDEX idx_users_location ON users USING GIST(location);

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'plumbing', 'electrical', 'carpentry', 'painting', 'cleaning',
        'hairdressing', 'driving', 'ac_repair', 'gardening', 'moving',
        'appliance_repair', 'photography'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('fixed', 'hourly', 'quote')),
    price DECIMAL(10,2),
    duration VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    images TEXT[], -- Array of image URLs
    booking_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for services
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category, is_active);
CREATE INDEX idx_services_provider_active ON services(provider_id, is_active);

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    description TEXT NOT NULL,

    -- Location (using PostGIS)
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    location_address TEXT NOT NULL,

    -- Payment
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) DEFAULT 0.00,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
    )),

    -- Timeline (stored as JSONB)
    timeline JSONB DEFAULT '[]'::jsonb,

    -- Cancellation
    cancel_reason TEXT,
    cancelled_by_id UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,

    -- Timestamps
    accepted_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Review
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    has_review BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_provider_status ON bookings(provider_id, status);
CREATE INDEX idx_bookings_location ON bookings USING GIST(location);
CREATE INDEX idx_bookings_scheduled_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    service VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES users(id),
    participant2_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    last_message_text TEXT,
    last_message_sender_id UUID REFERENCES users(id),
    last_message_timestamp TIMESTAMP,
    unread_count_user1 INTEGER DEFAULT 0,
    unread_count_user2 INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_conversation UNIQUE(participant1_id, participant2_id)
);

-- Indexes for conversations
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_timestamp DESC);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of {type, url, filename}
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    read_by JSONB DEFAULT '[]'::jsonb, -- Array of {user_id, read_at}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'payment', 'withdrawal', 'referral', 'service', 'refund', 'funding'
    )),
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) DEFAULT 0.00,
    description TEXT NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    withdrawal_id UUID,
    payment_gateway_provider VARCHAR(50),
    payment_gateway_reference VARCHAR(255),
    payment_gateway_metadata JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_category ON transactions(category);

-- ============================================================================
-- KYC TABLE
-- ============================================================================
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),

    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    lga VARCHAR(100) NOT NULL,

    -- Document Verification
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('NIN', 'Voters Card', 'Drivers License', 'Passport')),
    document_number VARCHAR(100) NOT NULL,
    document_front_url TEXT NOT NULL,
    document_back_url TEXT,

    -- Professional Information
    services TEXT[],
    experience TEXT,
    bio TEXT,
    profile_photo_url TEXT,

    -- Bank Information
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(10) NOT NULL,
    account_name VARCHAR(255) NOT NULL,

    -- Verification Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected')),
    rejection_reason TEXT,
    verified_at TIMESTAMP,
    verified_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for KYC
CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON kyc_documents(status);

-- ============================================================================
-- BANK ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10),
    account_number VARCHAR(10) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for bank accounts
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_user_default ON bank_accounts(user_id, is_default);

-- ============================================================================
-- WITHDRAWALS TABLE
-- ============================================================================
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 5000),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    processing_note TEXT,
    processed_at TIMESTAMP,
    processed_by_id UUID REFERENCES users(id),
    failure_reason TEXT,
    transaction_id UUID REFERENCES transactions(id),
    payment_gateway_provider VARCHAR(50),
    payment_gateway_reference VARCHAR(255),
    payment_gateway_transfer_code VARCHAR(255),
    payment_gateway_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for withdrawals
CREATE INDEX idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_reference ON withdrawals(reference);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'booking_new', 'booking_accepted', 'booking_cancelled', 'booking_completed',
        'message_new', 'payment_received', 'payment_sent', 'review_new',
        'referral_earned', 'kyc_status', 'withdrawal_completed', 'promotion'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    channels TEXT[], -- Array of 'push', 'email', 'sms'
    sent_channels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referred_id UUID NOT NULL REFERENCES users(id),
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 3),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_referral UNIQUE(referrer_id, referred_id)
);

-- Indexes for referrals
CREATE INDEX idx_referrals_referrer_level ON referrals(referrer_id, level);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_referrer_status ON referrals(referrer_id, status);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_exists BOOLEAN;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = result) INTO code_exists;
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- Function to calculate platform fee
CREATE OR REPLACE FUNCTION calculate_platform_fee()
RETURNS TRIGGER AS $$
BEGIN
    NEW.platform_fee := (NEW.amount * 15) / 100; -- 15% platform fee
    NEW.net_amount := NEW.amount - NEW.platform_fee;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_booking_fee
BEFORE INSERT OR UPDATE OF amount ON bookings
FOR EACH ROW
EXECUTE FUNCTION calculate_platform_fee();

-- Function to update provider rating when review is added
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(2,1);
    total_reviews INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, total_reviews
    FROM reviews
    WHERE provider_id = NEW.provider_id;

    UPDATE users
    SET rating = ROUND(avg_rating, 1),
        review_count = total_reviews
    WHERE id = NEW.provider_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_provider_rating
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_text = NEW.text,
        last_message_sender_id = NEW.sender_id,
        last_message_timestamp = NEW.created_at
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- Function to sync KYC status to user
CREATE OR REPLACE FUNCTION sync_kyc_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET kyc_status = NEW.status
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_kyc_status
AFTER INSERT OR UPDATE OF status ON kyc_documents
FOR EACH ROW
EXECUTE FUNCTION sync_kyc_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (can be customized based on requirements)
-- Users can read their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Services are publicly readable
CREATE POLICY services_select_all ON services FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY services_insert_own ON services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY services_update_own ON services FOR UPDATE USING (auth.uid() = provider_id);

-- Bookings readable by customer or provider
CREATE POLICY bookings_select_own ON bookings FOR SELECT
    USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Transactions readable by owner
CREATE POLICY transactions_select_own ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Notifications readable by owner
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert sample service categories as a reference
-- You can query this for dropdown lists
-- (Categories are enforced by CHECK constraint, this is just for documentation)

COMMENT ON COLUMN services.category IS 'Available categories: plumbing, electrical, carpentry, painting, cleaning, hairdressing, driving, ac_repair, gardening, moving, appliance_repair, photography';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for provider profiles with stats
CREATE OR REPLACE VIEW provider_profiles AS
SELECT
    u.id,
    u.name,
    u.email,
    u.phone,
    u.avatar,
    u.bio,
    u.state,
    u.lga,
    u.location,
    u.location_address,
    u.services,
    u.experience,
    u.working_days,
    u.working_hours_start,
    u.working_hours_end,
    u.rating,
    u.review_count,
    u.completed_jobs,
    u.profile_views,
    u.response_time,
    u.kyc_status,
    u.created_at,
    (SELECT COUNT(*) FROM services WHERE provider_id = u.id AND is_active = true) as active_services_count
FROM users u
WHERE u.role = 'provider';

-- View for booking details with related data
CREATE OR REPLACE VIEW booking_details AS
SELECT
    b.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    c.avatar as customer_avatar,
    p.name as provider_name,
    p.email as provider_email,
    p.phone as provider_phone,
    p.avatar as provider_avatar,
    p.rating as provider_rating,
    s.title as service_title,
    s.category as service_category
FROM bookings b
JOIN users c ON b.customer_id = c.id
JOIN users p ON b.provider_id = p.id
JOIN services s ON b.service_id = s.id;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Surlink database schema created successfully!';
    RAISE NOTICE 'Tables created: 12';
    RAISE NOTICE 'Triggers created: Multiple';
    RAISE NOTICE 'Views created: 2';
    RAISE NOTICE 'RLS enabled on all tables';
END $$;
