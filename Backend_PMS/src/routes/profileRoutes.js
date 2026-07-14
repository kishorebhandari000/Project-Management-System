const express = require('express');
const { updateMe, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // any logged-in user, no role restriction

router.put('/', updateMe);
router.put('/password', changePassword);

module.exports = router;