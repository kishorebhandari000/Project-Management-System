const express = require('express');
const { updateMe, changePassword, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProjectFile } = require('../middleware/upload');

const router = express.Router();

router.use(protect); // any logged-in user, no role restriction

router.put('/', updateMe);
router.put('/password', changePassword);
router.get('/', getMe);

module.exports = router;