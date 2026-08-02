const express = require('express');
const {
  createGroup,
  getMyGroups,
  getGroups,
  decideGroup,
  updateGroupMembers,
  withdrawGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);

router.post('/', roleGuard('student'), createGroup);
router.get('/my', roleGuard('student'), getMyGroups);
router.get('/', roleGuard('supervisor', 'admin'), getGroups);
router.put('/:id/decision', roleGuard('supervisor', 'admin'), decideGroup);
router.put('/:id/members', roleGuard('supervisor', 'admin'), updateGroupMembers);
router.delete('/:id', roleGuard('student'), withdrawGroup);

module.exports = router;