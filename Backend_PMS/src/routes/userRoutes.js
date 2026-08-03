const express = require('express');
const { createUser, getUsers, updateUser, deleteUser, searchStudents } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

router.use(protect);

router.get('/search-students', searchStudents);

router.post('/', roleGuard('admin'), createUser);
router.get('/', roleGuard('admin'), getUsers);
router.put('/:id', roleGuard('admin'), updateUser);
router.delete('/:id', roleGuard('admin'), deleteUser);

module.exports = router;