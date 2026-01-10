const { supabase } = require('../config/supabase');

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private (Provider only)
 */
exports.createService = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      price_type,
      price,
      duration,
      images
    } = req.body;

    // Validate required fields
    if (!category || !title || !description || !price_type || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Only providers can create services
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can create services'
      });
    }

    // Create service
    const { data, error } = await supabase
      .from('services')
      .insert([{
        provider_id: req.user.id,
        category,
        title,
        description,
        price_type,
        price: price || null,
        duration,
        images: images || [],
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Service creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create service',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

/**
 * @desc    Get all services with filters
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res) => {
  try {
    const {
      category,
      provider_id,
      price_min,
      price_max,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('services')
      .select('*, provider:users!provider_id(id, name, avatar, rating, review_count, location_address)')
      .eq('is_active', true);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (provider_id) {
      query = query.eq('provider_id', provider_id);
    }

    if (price_min) {
      query = query.gte('price', price_min);
    }

    if (price_max) {
      query = query.lte('price', price_max);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get services error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services',
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
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getService = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('services')
      .select('*, provider:users!provider_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Private (Provider - own service only)
 */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if service exists and belongs to user
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    // Update service
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update service error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update service',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
};

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Private (Provider - own service only)
 */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists and belongs to user
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Delete service error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete service',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
};

/**
 * @desc    Get services by category
 * @route   GET /api/services/category/:category
 * @access  Public
 */
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('services')
      .select('*, provider:users!provider_id(id, name, avatar, rating, review_count)', { count: 'exact' })
      .eq('category', category)
      .eq('is_active', true)
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get services by category error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      category,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};
