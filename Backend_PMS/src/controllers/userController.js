const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const validatePasswordStrength = require('../utils/validatePassword');
const { getCommittedStudentIds } = require('../utils/studentCommitment');
// @desc   Admin creates a user (student or supervisor)
// @route  POST /api/users
// @access Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, password, role } = req.body;
  let { email } = req.body;
  let studentId;

  if (!name || !password || !role) {
    return res.status(400).json({ message: 'name, password and role are required' });
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  if (role === 'supervisor') {
    email = await generateSupervisorEmail(name);
  } else if (role === 'student') {
    studentId = await generateStudentId();
    email = await generateStudentEmail(studentId);
  } else if (!email) {
    return res.status(400).json({ message: 'email is required for this role' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const userData = { name, email, password, role };

  if (role === 'student') {
    userData.studentId = studentId;
  }

  const user = await User.create(userData);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    },
  });
});

// Generates "firstname.lastname@pms.edu", appending a number if that's taken
async function generateSupervisorEmail(name) {
  const parts = name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const clean = (s) => s.replace(/[^a-z]/g, '');
  const first = clean(parts[0] || 'user');
  const last = clean(parts[parts.length - 1] || first);
  const base = parts.length > 1 ? `${first}.${last}` : first;

  let candidate = `${base}@pms.edu`;
  let suffix = 1;
  while (await User.findOne({ email: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}@pms.edu`;
  }
  return candidate;
}

// Generates "{studentId}@pms.edu", appending a number if that's taken
// (should be effectively impossible since studentId is already unique)
async function generateStudentEmail(studentId) {
  let candidate = `${studentId}@pms.edu`;
  let suffix = 1;
  while (await User.findOne({ email: candidate })) {
    suffix += 1;
    candidate = `${studentId}${suffix}@pms.edu`;
  }
  return candidate;
}

// Generates "2026" + zero-padded serial, e.g. "20260001", scoped to the current year
async function generateStudentId() {
  const year = new Date().getFullYear();
  const lastStudent = await User.findOne({
    role: 'student',
    studentId: { $regex: `^${year}` },
  }).sort({ studentId: -1 });

  let nextSerial = 1;
  if (lastStudent && lastStudent.studentId) {
    const serialPart = lastStudent.studentId.slice(String(year).length);
    nextSerial = parseInt(serialPart, 10) + 1;
  }

  return `${year}${String(nextSerial).padStart(4, '0')}`;
}

// @desc   List all users (optionally filter by role)
// @route  GET /api/users?role=student
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ count: users.length, users });
});

// @desc   Get my own profile
// @route  GET /api/profile
// @access Private (any logged-in user)
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      personalEmail: user.personalEmail,
    },
  });
});

// @desc   Update my own name/phone/address/personalEmail
// @route  PUT /api/profile
// @access Private (any logged-in user)
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address, personalEmail } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (personalEmail !== undefined) updates.personalEmail = personalEmail;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      personalEmail: user.personalEmail,
    },
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

  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.valid) {
    return res.status(400).json({ message: passwordCheck.message });
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

// @desc   Admin updates any user's name/email/role
// @route  PUT /api/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role) updates.role = role;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc   Admin deletes any user
// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ message: 'User deleted successfully' });
});

// @desc   Search fellow students by name/email/studentId (for group formation)
// @route  GET /api/users/search-students?q=...
// @access Private (any logged-in user)
const searchStudents = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.json({ users: [] });
  }

  const regex = new RegExp(q, 'i');
  const users = await User.find({
    role: 'student',
    _id: { $ne: req.user._id },
    $or: [{ name: regex }, { email: regex }, { studentId: regex }],
  })
    .select('name email studentId')
    .limit(10);

  const committedIds = await getCommittedStudentIds(users.map((u) => u._id));
  const usersWithStatus = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    studentId: u.studentId,
    alreadyCommitted: committedIds.has(u._id.toString()),
  }));

  res.json({ users: usersWithStatus });
});
module.exports = { createUser, getUsers, getMe, updateMe, changePassword, updateUser, deleteUser, searchStudents };