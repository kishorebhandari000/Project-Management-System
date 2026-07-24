const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const transporter = require('../utils/mailer');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'email is required' });
  }

  const user = await User.findOne({ email });

  // Always respond the same way, whether or not the email exists —
  // prevents leaking which emails are registered
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const rawToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${rawToken}`;

  await transporter.sendMail({
    from: `"Project Management System" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Reset your password',
    text: `You requested a password reset. Click this link to set a new password (valid for 1 hour): ${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  });

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'password is required' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
  }

  user.password = password; // pre('save') hook re-hashes it
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
});

module.exports = { register, login, getMe, forgotPassword, resetPassword };
