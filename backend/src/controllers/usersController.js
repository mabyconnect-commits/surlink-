const { supabase } = require('../config/supabase');

/**
 * @desc    Get all providers
 * @route   GET /api/users/providers
 * @access  Public
 */
exports.getProviders = async (req, res) => {
  try {
    const {
      category,
      state,
      lga,
      min_rating,
      kyc_verified,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, email, phone, avatar, bio, state, lga, location_address, services, experience, rating, review_count, completed_jobs, kyc_status, created_at', { count: 'exact' })
      .eq('role', 'provider')
      .eq('is_active', true);

    // Apply filters
    if (state) {
      query = query.eq('state', state);
    }

    if (lga) {
      query = query.eq('lga', lga);
    }

    if (min_rating) {
      query = query.gte('rating', parseFloat(min_rating));
    }

    if (kyc_verified === 'true') {
      query = query.eq('kyc_status', 'verified');
    }

    if (category) {
      query = query.contains('services', [category]);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('rating', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get providers error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch providers',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error.message
    });
  }
};

/**
 * @desc    Get single provider details
 * @route   GET /api/users/providers/:id
 * @access  Public
 */
exports.getProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: provider, error } = await supabase
      .from('users')
      .select('id, name, email, phone, avatar, bio, address, state, lga, location_address, services, experience, working_days, working_hours_start, working_hours_end, rating, review_count, completed_jobs, profile_views, response_time, kyc_status, created_at')
      .eq('id', id)
      .eq('role', 'provider')
      .single();

    if (error || !provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get provider's services
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', id)
      .eq('is_active', true);

    // Get recent reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, customer:users!customer_id(id, name, avatar)')
      .eq('provider_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Increment profile views
    await supabase
      .from('users')
      .update({ profile_views: (provider.profile_views || 0) + 1 })
      .eq('id', id);

    res.status(200).json({
      success: true,
      data: {
        ...provider,
        services: services || [],
        reviews: reviews || []
      }
    });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider',
      error: error.message
    });
  }
};

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query: searchQuery, role, page = 1, limit = 20 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let query = supabase
      .from('users')
      .select('id, name, email, phone, avatar, role, state, lga', { count: 'exact' })
      .eq('is_active', true);

    if (role) {
      query = query.eq('role', role);
    }

    query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search users error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message
    });
  }
};
