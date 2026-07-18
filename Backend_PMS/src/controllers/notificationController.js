const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');

// Internal helper other controllers call - not a route handler itself
async function createNotification({ user, type, title, message, link }) {
  return Notification.create({ user, type, title, message, link });
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