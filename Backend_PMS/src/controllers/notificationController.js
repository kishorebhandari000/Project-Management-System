const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const transporter = require('../utils/mailer');
const realtime = require('../utils/realtime');

// Internal helper other controllers call - not a route handler itself
async function createNotification({ user, type, title, message, link }) {
  const notification = await Notification.create({ user, type, title, message, link });

  // 1. Push live if the user is connected
  realtime.pushToUser(user, 'notification', notification);

  // 2. Email them too
  const recipient = await User.findById(user).select('email');
  if (recipient?.email) {
    transporter
      .sendMail({
        from: `"Project Management System" <${process.env.SMTP_USER}>`,
        to: recipient.email,
        subject: title,
        text: message,
      })
      .catch((err) => console.error('Email send failed:', err));
  }

  return notification;
}

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((n) => !n.read).length;
  res.json({ count: notifications.length, unreadCount, notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ notification });
});

module.exports = { createNotification, getMyNotifications, markAsRead };