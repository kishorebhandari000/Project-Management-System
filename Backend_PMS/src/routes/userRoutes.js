const express = require('express');
const { createUser, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect, roleGuard('admin'));

router.post('/', createUser);
router.get('/', getUsers);

module.exports = router;