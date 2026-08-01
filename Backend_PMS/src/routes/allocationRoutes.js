const express = require('express');
const {
  requestAllocation,
  getAllocations,
  decideAllocation,
  forceAssignAllocation,
} = require('../controllers/allocationController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);
router.get('/', getAllocations);
router.post('/', roleGuard('student'), requestAllocation);
// Admin safety-net override: force-assign/reassign, auto-approved.
router.post('/assign', roleGuard('admin'), forceAssignAllocation);
// Supervisor is the default approver; admin is a fallback who can also decide.
router.put('/:id/decision', roleGuard('supervisor', 'admin'), decideAllocation);

module.exports = router;