const Notification = require('../models/Notification');
const transporter = require('./mailer');

async function sendNotification(app, { userId, email, title, message }) {
  const notification = await Notification.create({ user: userId, title, message });

  const io = app.get('io');
  const userSockets = app.get('userSockets');
  const socketId = userSockets.get(String(userId));
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }

  transporter
    .sendMail({
      from: `"Project Management System" <${process.env.SMTP_USER}>`,
      to: email,
      subject: title,
      text: message,
    })
    .catch((err) => console.error('Email send failed:', err));

  return notification;
}

module.exports = sendNotification;