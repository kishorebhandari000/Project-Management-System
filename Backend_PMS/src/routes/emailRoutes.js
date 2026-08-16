const express = require('express');
const { sendDirectEmail } = require('../controllers/emailController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.post('/', protect, roleGuard('admin', 'supervisor', 'student'), sendDirectEmail);

module.exports = router;
