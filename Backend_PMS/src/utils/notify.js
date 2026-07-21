const Notification = require('../models/Notification');
const transporter = require('./mailer');
const realtime = require('./realtime');

async function sendNotification(_app, { userId, email, title, message }) {
  const notification = await Notification.create({ user: userId, title, message });

  // Push live if the user is connected
  realtime.pushToUser(userId, 'notification', notification);

  // Email them too
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