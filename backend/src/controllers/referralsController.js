const { supabase } = require('../config/supabase');

/**
 * @desc    Get referral stats
 * @route   GET /api/referrals/stats
 * @access  Private
 */
exports.getReferralStats = async (req, res) => {
  try {
    // Get user's referral code
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', req.user.id)
      .single();

    // Get referral statistics
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:users!referred_user_id(id, name, email, created_at)
      `)
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get referral stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch referral stats',
        error: error.message
      });
    }

    // Calculate totals
    const totalReferrals = referrals.length;
    const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.total_earnings || 0), 0);
    const totalCommission = referrals.reduce((sum, ref) => sum + (ref.total_commission || 0), 0);
    const activeReferrals = referrals.filter(ref => ref.is_active).length;

    res.status(200).json({
      success: true,
      data: {
        referral_code: user?.referral_code,
        total_referrals: totalReferrals,
        active_referrals: activeReferrals,
        total_earnings: totalEarnings,
        total_commission: totalCommission,
        referrals: referrals.map(ref => ({
          id: ref.id,
          referred_user: ref.referred_user,
          level: ref.level,
          is_active: ref.is_active,
          total_earnings: ref.total_earnings || 0,
          total_commission: ref.total_commission || 0,
          created_at: ref.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get referral earnings history
 * @route   GET /api/referrals/earnings
 * @access  Private
 */
exports.getReferralEarnings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get referral earnings from transactions
    const { data, error, count } = await supabase
      .from('transactions')
      .select(`
        *,
        booking:bookings(
          id,
          service:services(title),
          provider:users!provider_id(name)
        )
      `, { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('category', 'referral')
      .eq('type', 'credit')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get referral earnings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch referral earnings',
        error: error.message
      });
    }

    // Calculate total earnings
    const totalEarnings = data.reduce((sum, txn) => sum + txn.amount, 0);

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      total_earnings: totalEarnings,
      data
    });
  } catch (error) {
    console.error('Get referral earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral earnings',
      error: error.message
    });
  }
};

/**
 * @desc    Verify referral code
 * @route   GET /api/referrals/verify/:code
 * @access  Public
 */
exports.verifyReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    // Find user with this referral code
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, referral_code, role, kyc_verified')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Valid referral code',
      data: {
        referrer_name: user.name,
        referrer_role: user.role,
        referral_code: user.referral_code
      }
    });
  } catch (error) {
    console.error('Verify referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying referral code',
      error: error.message
    });
  }
};

/**
 * @desc    Process referral commission
 * @route   POST /api/referrals/process-commission
 * @access  Private (Internal use - called by booking controller)
 */
exports.processReferralCommission = async (bookingId, providerId, amount) => {
  try {
    // Get commission percentages from env
    const level1Percentage = parseFloat(process.env.REFERRAL_LEVEL_1_PERCENTAGE || 2.5);
    const level2Percentage = parseFloat(process.env.REFERRAL_LEVEL_2_PERCENTAGE || 1.5);
    const level3Percentage = parseFloat(process.env.REFERRAL_LEVEL_3_PERCENTAGE || 1.0);

    // Get provider's referral chain
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', providerId)
      .eq('is_active', true)
      .order('level', { ascending: true })
      .limit(3);

    if (!referrals || referrals.length === 0) {
      return; // No referrals to process
    }

    // Process commission for each level
    for (const referral of referrals) {
      let commissionPercentage = 0;

      if (referral.level === 1) {
        commissionPercentage = level1Percentage;
      } else if (referral.level === 2) {
        commissionPercentage = level2Percentage;
      } else if (referral.level === 3) {
        commissionPercentage = level3Percentage;
      }

      if (commissionPercentage === 0) continue;

      // Calculate commission amount
      const commissionAmount = Math.round((amount * commissionPercentage) / 100);

      // Create transaction for referrer
      const { error: txnError } = await supabase
        .from('transactions')
        .insert([{
          user_id: referral.referrer_id,
          type: 'credit',
          category: 'referral',
          amount: commissionAmount,
          description: `Level ${referral.level} referral commission from booking`,
          reference: `REF-${bookingId}-L${referral.level}`,
          status: 'completed',
          booking_id: bookingId
        }]);

      if (txnError) {
        console.error('Referral commission transaction error:', txnError);
        continue;
      }

      // Update referrer's balance
      await supabase.rpc('update_user_balance', {
        p_user_id: referral.referrer_id,
        p_amount: commissionAmount
      });

      // Update referral earnings tracking
      await supabase
        .from('referrals')
        .update({
          total_commission: supabase.sql`total_commission + ${commissionAmount}`,
          total_earnings: supabase.sql`total_earnings + ${amount}`
        })
        .eq('id', referral.id);
    }

    return true;
  } catch (error) {
    console.error('Process referral commission error:', error);
    return false;
  }
};

/**
 * @desc    Get referral leaderboard
 * @route   GET /api/referrals/leaderboard
 * @access  Public
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get top referrers by total commission
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        avatar,
        role,
        referral_code,
        referrals:referrals!referrer_id(
          total_commission
        )
      `)
      .not('referral_code', 'is', null)
      .limit(parseInt(limit));

    if (error) {
      console.error('Get leaderboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message
      });
    }

    // Calculate total commission for each user
    const leaderboard = data
      .map(user => {
        const totalCommission = user.referrals?.reduce((sum, ref) => sum + (ref.total_commission || 0), 0) || 0;
        const totalReferrals = user.referrals?.length || 0;

        return {
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          referral_code: user.referral_code,
          total_referrals: totalReferrals,
          total_commission: totalCommission
        };
      })
      .filter(user => user.total_commission > 0)
      .sort((a, b) => b.total_commission - a.total_commission)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};
