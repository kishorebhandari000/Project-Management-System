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
// Admin safety-net override: force-assign/reassign, auto-approved. Admin does
// not use the regular decision flow - only the project's supervisor does.
router.post('/assign', roleGuard('admin'), forceAssignAllocation);
router.put('/:id/decision', roleGuard('supervisor'), decideAllocation);

module.exports = router;