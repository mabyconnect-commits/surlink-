const { supabase } = require('../config/supabase');
const { sendEmail, sendBookingNotification } = require('../utils/email');

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      service_id,
      scheduled_date,
      scheduled_time,
      description,
      location_address,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!service_id || !scheduled_date || !scheduled_time || !description || !location_address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*, provider:users!provider_id(*)')
      .eq('id', service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or no longer available'
      });
    }

    // Create location point
    const location = latitude && longitude
      ? `POINT(${longitude} ${latitude})`
      : null;

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        service_id,
        provider_id: service.provider_id,
        customer_id: req.user.id,
        scheduled_date,
        scheduled_time,
        description,
        location_address,
        location,
        amount: service.price || 0,
        status: 'pending',
        timeline: JSON.stringify([{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Booking created'
        }])
      }])
      .select('*, service:services(*), provider:users!provider_id(*), customer:users!customer_id(*)')
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: error.message
      });
    }

    // Send notification email to provider
    try {
      await sendBookingNotification('new', service.provider.email, {
        providerName: service.provider.name,
        customerName: req.user.name,
        serviceName: service.title,
        date: scheduled_date,
        time: scheduled_time
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * @desc    Get all bookings for user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select('*, service:services(*), provider:users!provider_id(id, name, avatar, phone), customer:users!customer_id(id, name, avatar, phone)', { count: 'exact' });

    // Filter by user role
    if (req.user.role === 'provider') {
      query = query.eq('provider_id', req.user.id);
    } else {
      query = query.eq('customer_id', req.user.id);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    query = query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Get bookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings',
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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bookings')
      .select('*, service:services(*), provider:users!provider_id(*), customer:users!customer_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (data.customer_id !== req.user.id && data.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

/**
 * @desc    Accept booking
 * @route   PUT /api/bookings/:id/accept
 * @access  Private (Provider only)
 */
exports.acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, customer:users!customer_id(*)')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this booking'
      });
    }

    // Check status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking with status: ${booking.status}`
      });
    }

    // Update booking
    const timeline = JSON.parse(booking.timeline || '[]');
    timeline.push({
      status: 'accepted',
      timestamp: new Date().toISOString(),
      note: 'Booking accepted by provider'
    });

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        timeline: JSON.stringify(timeline)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Accept booking error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to accept booking',
        error: error.message
      });
    }

    // Send notification to customer
    try {
      await sendBookingNotification('accepted', booking.customer.email, {
        customerName: booking.customer.name,
        serviceName: booking.service?.title || 'Service',
        date: booking.scheduled_date,
        time: booking.scheduled_time
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      data
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting booking',
      error: error.message
    });
  }
};

/**
 * @desc    Start booking (in progress)
 * @route   PUT /api/bookings/:id/start
 * @access  Private (Provider only)
 */
exports.startBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Cannot start booking with status: ${booking.status}`
      });
    }

    const timeline = JSON.parse(booking.timeline || '[]');
    timeline.push({
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      note: 'Work started'
    });

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        timeline: JSON.stringify(timeline)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to start booking',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking started successfully',
      data
    });
  } catch (error) {
    console.error('Start booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting booking',
      error: error.message
    });
  }
};

/**
 * @desc    Complete booking
 * @route   PUT /api/bookings/:id/complete
 * @access  Private (Provider only)
 */
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, customer:users!customer_id(*)')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete booking with status: ${booking.status}`
      });
    }

    const timeline = JSON.parse(booking.timeline || '[]');
    timeline.push({
      status: 'completed',
      timestamp: new Date().toISOString(),
      note: 'Work completed'
    });

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        timeline: JSON.stringify(timeline)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to complete booking',
        error: error.message
      });
    }

    // Update provider's completed jobs count
    await supabase.rpc('increment', {
      table_name: 'users',
      column_name: 'completed_jobs',
      row_id: req.user.id
    });

    // Send notification to customer
    try {
      await sendBookingNotification('completed', booking.customer.email, {
        customerName: booking.customer.name,
        serviceName: booking.service?.title || 'Service'
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (Customer or Provider)
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, customer:users!customer_id(*), provider:users!provider_id(*)')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.customer_id !== req.user.id && booking.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Cannot cancel completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    const timeline = JSON.parse(booking.timeline || '[]');
    timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: `Cancelled by ${req.user.role}: ${reason || 'No reason provided'}`
    });

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancel_reason: reason,
        cancelled_by_id: req.user.id,
        cancelled_at: new Date().toISOString(),
        timeline: JSON.stringify(timeline)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: error.message
      });
    }

    // Send notification to the other party
    const recipientEmail = booking.customer_id === req.user.id
      ? booking.provider.email
      : booking.customer.email;

    const recipientName = booking.customer_id === req.user.id
      ? booking.provider.name
      : booking.customer.name;

    try {
      await sendBookingNotification('cancelled', recipientEmail, {
        customerName: recipientName,
        serviceName: booking.service?.title || 'Service',
        reason: reason || 'No reason provided'
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};
