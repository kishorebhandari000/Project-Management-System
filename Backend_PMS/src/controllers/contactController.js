const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const transporter = require('../utils/mailer');
const { appendContactSubmission } = require('../utils/googleSheets');

// @desc   Send a message from the public contact form
// @route  POST /api/contact
// @access Public
const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email and message are required' });
  }
  appendContactSubmission({ name, email, message }).catch((err) =>
    console.error('Failed to log contact submission to Google Sheets:', err)
  );
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff;">
      <div style="background: #2563a8; padding: 24px; text-align: center;">
        <img src="cid:pms-logo" alt="Project Management System" style="height: 40px;" />
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #1e3a5f; margin-top: 0;">New contact form message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 80px;">Name</td>
            <td style="padding: 6px 0; color: #111827;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Email</td>
            <td style="padding: 6px 0; color: #111827;">${email}</td>
          </tr>
        </table>
        <div style="background: #f4f6f8; border-radius: 8px; padding: 16px; color: #374151; line-height: 1.6;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
      </div>
      <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
        Sent from the Project Management System contact form
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../assets/logo.png'),
        cid: 'pms-logo',
      },
    ],
  });

  res.status(200).json({ message: 'Message sent successfully' });
});

module.exports = { sendContactMessage };