const express = require('express');
const { getSummary } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.get('/summary', protect, roleGuard('admin'), getSummary);

module.exports = router;
