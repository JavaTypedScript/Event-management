const express = require('express');
const router = express.Router();
const { accessConversation, fetchChats, getMessages,joinEventGroup } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/', protect, fetchChats);          // List all my chats
router.post('/group/:eventId', protect, joinEventGroup); // Group chat (must come before POST /)
router.post('/', protect, accessConversation); // Start/Open a specific chat (catch-all post)
router.get('/:chatId', protect, getMessages);  // Get history

module.exports = router;