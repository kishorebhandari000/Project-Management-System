const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const transporter = require('../utils/mailer');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc   Supervisor/Admin/Student sends a free-text email via the real SMTP
//         transporter. Admin and supervisor can email any address, matching
//         the old (dead, Supabase-based) feature's behavior. A student may
//         only email an address that belongs to an existing supervisor
//         account - enforced below, not just suggested by the UI.
// @route  POST /api/emails
// @access Private/Admin,Supervisor,Student
const sendDirectEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, subject, message } = req.body;

  if (!recipientEmail || !subject || !message) {
    return res.status(400).json({ message: 'recipientEmail, subject and message are required' });
  }

  // Looked up once, up front - doubles as the student-role precondition
  // check below and as the courtesy in-app notification target further down.
  const recipientUser = await User.findOne({ email: recipientEmail.trim().toLowerCase() });

  if (req.user.role === 'student' && (!recipientUser || recipientUser.role !== 'supervisor')) {
    return res.status(403).json({ message: 'You can only email a supervisor' });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: #2563a8; padding: 24px; text-align: center;">
        <img src="cid:pms-logo" alt="Project Management System" style="height: 40px;" />
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #6b7280; margin-top: 0;">
          Message from <strong style="color: #111827;">${req.user.name}</strong> (${req.user.role})
        </p>
        <div style="background: #f4f6f8; border-radius: 8px; padding: 16px; color: #374151; line-height: 1.6;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      </div>
      <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
        Sent via the Project Management System
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: recipientEmail,
    replyTo: req.user.email,
    subject,
    text: `From: ${req.user.name} (${req.user.role})\n\n${message}`,
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'pms-logo',
      },
    ],
  });

  // Courtesy in-app trace, only when the typed address happens to belong to
  // a known account - the email itself already went out either way.
  if (recipientUser) {
    await createNotification({
      user: recipientUser._id,
      type: 'direct_email',
      title: `New email from ${req.user.name}`,
      message: `${req.user.name} (${req.user.role}) sent you an email: "${subject}"`,
    }).catch(() => {});
  }

  res.json({ message: 'Email sent successfully' });
});

module.exports = { sendDirectEmail };
