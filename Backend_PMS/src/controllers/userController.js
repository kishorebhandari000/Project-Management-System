const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc   Admin creates a user (student or supervisor)
// @route  POST /api/users
// @access Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc   List all users (optionally filter by role)
// @route  GET /api/users?role=student
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ count: users.length, users });
});
// @desc   Update my own name/email
// @route  PUT /api/profile
// @access Private (any logged-in user)
const updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc   Change my own password
// @route  PUT /api/profile/password
// @access Private (any logged-in user)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword; // pre('save') hook re-hashes it
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = { createUser, getUsers, updateMe, changePassword };