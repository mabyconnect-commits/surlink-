const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  deleteConversation
} = require('../controllers/messagesController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversation', getOrCreateConversation);
router.delete('/conversation/:id', deleteConversation);

// Message routes
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;
