const express = require('express');
const { getContacts, getConversation, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/contacts', getContacts);
router.get('/:contactId', getConversation);
router.post('/', sendMessage);

module.exports = router;
