const { supabase } = require('../config/supabase');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const { type, is_read, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    // Filter by type if provided
    if (type && ['booking', 'payment', 'review', 'kyc', 'message', 'system'].includes(type)) {
      query = query.eq('type', type);
    }

    // Filter by read status
    if (is_read !== undefined) {
      query = query.eq('is_read', is_read === 'true');
    }

    const { data, error, count } = await query
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
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
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: {
        unread_count: count || 0
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
exports.clearReadNotifications = async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', req.user.id)
      .eq('is_read', true);

    if (error) {
      console.error('Clear read notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear read notifications',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Read notifications cleared successfully'
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing read notifications',
      error: error.message
    });
  }
};

/**
 * Helper function to create notification
 * Can be called from other controllers
 */
exports.createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        data
      }]);

    if (error) {
      console.error('Create notification error:', error);
    }
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
