const express = require('express');
const { requestAllocation, getAllocations, decideAllocation } = require('../controllers/allocationController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.get('/', getAllocations);
router.post('/', roleGuard('student'), requestAllocation);
router.put('/:id/decision', roleGuard('supervisor', 'admin'), decideAllocation);

module.exports = router;