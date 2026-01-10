const { supabase } = require('../config/supabase');

/**
 * @desc    Get all conversations for user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Get conversations where user is either participant
    const { data, error, count } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!participant1_id(id, name, avatar, role),
        participant2:users!participant2_id(id, name, avatar, role),
        booking:bookings(id, service:services(title))
      `, { count: 'exact' })
      .or(`participant1_id.eq.${req.user.id},participant2_id.eq.${req.user.id}`)
      .eq('is_active', true)
      .range(offset, offset + parseInt(limit) - 1)
      .order('last_message_timestamp', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
        error: error.message
      });
    }

    // Format conversations to show "other" participant
    const formattedData = data.map(conv => {
      const otherParticipant = conv.participant1_id === req.user.id
        ? conv.participant2
        : conv.participant1;

      const unreadCount = conv.participant1_id === req.user.id
        ? conv.unread_count_user1
        : conv.unread_count_user2;

      return {
        ...conv,
        other_participant: otherParticipant,
        unread_count: unreadCount
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: formattedData
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

/**
 * @desc    Get or create conversation
 * @route   POST /api/messages/conversation
 * @access  Private
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participant_id, booking_id } = req.body;

    if (!participant_id) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    if (participant_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists (bidirectional)
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1_id.eq.${req.user.id},participant2_id.eq.${participant_id}),and(participant1_id.eq.${participant_id},participant2_id.eq.${req.user.id})`)
      .single();

    if (existing) {
      // Return existing conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:users!participant1_id(id, name, avatar, role),
          participant2:users!participant2_id(id, name, avatar, role)
        `)
        .eq('id', existing.id)
        .single();

      return res.status(200).json({
        success: true,
        message: 'Conversation found',
        data: conversation
      });
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert([{
        participant1_id: req.user.id,
        participant2_id: participant_id,
        booking_id: booking_id || null,
        is_active: true
      }])
      .select(`
        *,
        participant1:users!participant1_id(id, name, avatar, role),
        participant2:users!participant2_id(id, name, avatar, role)
      `)
      .single();

    if (error) {
      console.error('Create conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Conversation created',
      data: newConversation
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Get messages
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(id, name, avatar)', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }

    // Mark messages as read
    const unreadMessageIds = data
      .filter(msg => msg.sender_id !== req.user.id && msg.status !== 'read')
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await supabase
        .from('messages')
        .update({ status: 'read' })
        .in('id', unreadMessageIds);

      // Reset unread count
      const updateField = conversation.participant1_id === req.user.id
        ? 'unread_count_user1'
        : 'unread_count_user2';

      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);
    }

    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: data.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

/**
 * @desc    Send message
 * @route   POST /api/messages/:conversationId
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, attachments } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Verify user is part of conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: req.user.id,
        text: text.trim(),
        attachments: attachments || [],
        status: 'sent'
      }])
      .select('*, sender:users!sender_id(id, name, avatar)')
      .single();

    if (error) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }

    // Increment unread count for recipient
    const recipientField = conversation.participant1_id === req.user.id
      ? 'unread_count_user2'
      : 'unread_count_user1';

    await supabase
      .from('conversations')
      .update({
        [recipientField]: (conversation[recipientField] || 0) + 1
      })
      .eq('id', conversationId);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:messageId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Get message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*, conversation:conversations(*)')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is recipient
    if (message.sender_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark own message as read'
      });
    }

    const isParticipant = message.conversation.participant1_id === req.user.id
      || message.conversation.participant2_id === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update message status
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('id', messageId);

    if (error) {
      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark message as read',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Get message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify ownership
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Delete message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Delete message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

/**
 * @desc    Delete conversation
 * @route   DELETE /api/messages/conversation/:id
 * @access  Private
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is part of conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    if (conversation.participant1_id !== req.user.id && conversation.participant2_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('conversations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Delete conversation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete conversation',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};
