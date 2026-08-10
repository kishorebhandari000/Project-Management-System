const express = require('express');
const {
  getContacts,
  getMessages,
  sendMessage,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Message Routes
|--------------------------------------------------------------------------
*/

// Get contacts available to the logged-in user
// GET /api/messages/contacts
router.get('/contacts', protect, getContacts);

// Get conversation with a selected user
// GET /api/messages/:userId
router.get('/:userId', protect, getMessages);

// Send a new message
// POST /api/messages
router.post('/', protect, sendMessage);

// Delete a message
// DELETE /api/messages/:messageId
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;