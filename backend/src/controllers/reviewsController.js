const { supabase } = require('../config/supabase');

/**
 * @desc    Create review for completed booking
 * @route   POST /api/reviews
 * @access  Private (Customer only)
 */
exports.createReview = async (req, res) => {
  try {
    const { booking_id, rating, review } = req.body;

    // Validate input
    if (!booking_id || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking_id, rating, and review'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(title)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify customer owns this booking
    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        booking_id,
        provider_id: booking.provider_id,
        customer_id: req.user.id,
        service: booking.service?.title || 'Service',
        rating,
        review,
        is_verified: true
      }])
      .select('*, customer:users!customer_id(id, name, avatar), provider:users!provider_id(id, name)')
      .single();

    if (error) {
      console.error('Create review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }

    // Update booking with review info
    await supabase
      .from('bookings')
      .update({
        rating,
        review,
        has_review: true
      })
      .eq('id', booking_id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reviews for a provider
 * @route   GET /api/reviews/provider/:id
 * @access  Public
 */
exports.getProviderReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, rating } = req.query;

    let query = supabase
      .from('reviews')
      .select('*, customer:users!customer_id(id, name, avatar), booking:bookings(id, service:services(title))', { count: 'exact' })
      .eq('provider_id', id);

    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }

    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get provider reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
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
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

/**
 * @desc    Get review for specific booking
 * @route   GET /api/reviews/booking/:id
 * @access  Private
 */
exports.getBookingReview = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, customer:users!customer_id(id, name, avatar), provider:users!provider_id(id, name)')
      .eq('booking_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get booking review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private (Customer - own review only)
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    // Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (existingReview.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update review
    const updateData = {};
    if (rating) updateData.rating = rating;
    if (review) updateData.review = review;

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select('*, customer:users!customer_id(id, name, avatar)')
      .single();

    if (error) {
      console.error('Update review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error.message
      });
    }

    // Update booking if rating changed
    if (rating) {
      await supabase
        .from('bookings')
        .update({ rating, review: review || existingReview.review })
        .eq('id', existingReview.booking_id);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Customer - own review only)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Get existing review
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (existingReview.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Delete review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete review error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message
      });
    }

    // Update booking
    await supabase
      .from('bookings')
      .update({
        rating: null,
        review: null,
        has_review: false
      })
      .eq('id', existingReview.booking_id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Private
 */
exports.getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*, provider:users!provider_id(id, name, avatar), booking:bookings(id, service:services(title))', { count: 'exact' })
      .eq('customer_id', req.user.id)
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my reviews error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
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
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};
