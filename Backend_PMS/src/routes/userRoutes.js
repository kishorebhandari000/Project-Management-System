const express = require('express');
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect, roleGuard('admin'));

router.post('/', createUser);
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;