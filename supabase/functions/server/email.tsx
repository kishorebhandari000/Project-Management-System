// Email service functions using Resend API

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'Project Management System <onboarding@resend.dev>' }: EmailParams) {
  const apiKey = Deno.env.get('RESEND_API_KEY');

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

// Template: Assessment submitted notification to supervisor
export function assessmentSubmittedTemplate(data: {
  studentName: string;
  assessmentTitle: string;
  projectName: string;
  submissionDate: string;
  viewUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563a8; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f6f8; padding: 20px; }
          .button { display: inline-block; background-color: #2563a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Assessment Submission</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${data.studentName}</strong> has submitted an assessment for your review.</p>
            <p><strong>Assessment:</strong> ${data.assessmentTitle}</p>
            <p><strong>Project:</strong> ${data.projectName}</p>
            <p><strong>Submitted on:</strong> ${data.submissionDate}</p>
            <p>Please review and grade the submission at your earliest convenience.</p>
            <a href="${data.viewUrl}" class="button">View Submission</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the Project Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template: Assessment graded notification to student
export function assessmentGradedTemplate(data: {
  studentName: string;
  assessmentTitle: string;
  marks: number;
  totalMarks: number;
  feedback: string;
  viewUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563a8; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f6f8; padding: 20px; }
          .grade { font-size: 32px; font-weight: bold; color: #2563a8; text-align: center; margin: 20px 0; }
          .feedback-box { background-color: white; padding: 15px; border-left: 4px solid #2563a8; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Assessment Graded</h1>
          </div>
          <div class="content">
            <p>Hi ${data.studentName},</p>
            <p>Your supervisor has graded your assessment: <strong>${data.assessmentTitle}</strong></p>
            <div class="grade">${data.marks} / ${data.totalMarks}</div>
            <div class="feedback-box">
              <h3>Feedback:</h3>
              <p>${data.feedback}</p>
            </div>
            <a href="${data.viewUrl}" class="button">View Full Feedback</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the Project Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template: Submission confirmation to student
export function submissionConfirmationTemplate(data: {
  studentName: string;
  assessmentTitle: string;
  submissionDate: string;
  viewUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f6f8; padding: 20px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .info-box { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Submission Successful</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <p>Hi ${data.studentName},</p>
            <p>Your assessment has been successfully submitted!</p>
            <div class="info-box">
              <p><strong>Assessment:</strong> ${data.assessmentTitle}</p>
              <p><strong>Submitted on:</strong> ${data.submissionDate}</p>
              <p><strong>Status:</strong> Submitted - Awaiting Review</p>
            </div>
            <p>Your supervisor has been notified and will review your submission. You will receive another email when your work has been graded.</p>
            <a href="${data.viewUrl}" class="button">View Submission</a>
          </div>
          <div class="footer">
            <p>This is an automated confirmation from the Project Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template: Direct message notification
export function directMessageTemplate(data: {
  recipientName: string;
  senderName: string;
  senderRole: string;
  subject: string;
  message: string;
  replyUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563a8; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f6f8; padding: 20px; }
          .message-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .sender-info { color: #666; font-size: 14px; margin-bottom: 15px; }
          .button { display: inline-block; background-color: #2563a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Message</h1>
          </div>
          <div class="content">
            <p>Hi ${data.recipientName},</p>
            <p>You have received a new message from <strong>${data.senderName}</strong> (${data.senderRole}).</p>
            <div class="message-box">
              <div class="sender-info">From: ${data.senderName} | Subject: ${data.subject}</div>
              <p>${data.message}</p>
            </div>
            <a href="${data.replyUrl}" class="button">Reply to Message</a>
          </div>
          <div class="footer">
            <p>This is an automated message from the Project Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
