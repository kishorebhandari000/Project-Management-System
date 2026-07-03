import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  sendEmail,
  assessmentSubmittedTemplate,
  assessmentGradedTemplate,
  submissionConfirmationTemplate,
  directMessageTemplate
} from "./email.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ec7aca5b/health", (c) => {
  return c.json({ status: "ok" });
});

// Email endpoint: Notify supervisor of assessment submission
app.post("/make-server-ec7aca5b/email/assessment-submitted", async (c) => {
  try {
    const body = await c.req.json();
    const { supervisorEmail, studentName, assessmentTitle, projectName, submissionDate, viewUrl } = body;

    if (!supervisorEmail || !studentName || !assessmentTitle) {
      return c.json({ error: 'Missing required fields: supervisorEmail, studentName, assessmentTitle' }, 400);
    }

    const html = assessmentSubmittedTemplate({
      studentName,
      assessmentTitle,
      projectName: projectName || 'Your Project',
      submissionDate: submissionDate || new Date().toLocaleDateString(),
      viewUrl: viewUrl || '#',
    });

    const result = await sendEmail({
      to: supervisorEmail,
      subject: `New Assessment Submission: ${assessmentTitle}`,
      html,
    });

    console.log('Assessment submission email sent successfully:', result);
    return c.json({ success: true, message: 'Email sent successfully', emailId: result.id });
  } catch (error) {
    console.error('Error sending assessment submission email:', error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

// Email endpoint: Notify student of graded assessment
app.post("/make-server-ec7aca5b/email/assessment-graded", async (c) => {
  try {
    const body = await c.req.json();
    const { studentEmail, studentName, assessmentTitle, marks, totalMarks, feedback, viewUrl } = body;

    if (!studentEmail || !studentName || !assessmentTitle || marks === undefined || !totalMarks) {
      return c.json({ error: 'Missing required fields: studentEmail, studentName, assessmentTitle, marks, totalMarks' }, 400);
    }

    const html = assessmentGradedTemplate({
      studentName,
      assessmentTitle,
      marks,
      totalMarks,
      feedback: feedback || 'No additional feedback provided.',
      viewUrl: viewUrl || '#',
    });

    const result = await sendEmail({
      to: studentEmail,
      subject: `Assessment Graded: ${assessmentTitle}`,
      html,
    });

    console.log('Assessment graded email sent successfully:', result);
    return c.json({ success: true, message: 'Email sent successfully', emailId: result.id });
  } catch (error) {
    console.error('Error sending assessment graded email:', error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

// Email endpoint: Submission confirmation to student
app.post("/make-server-ec7aca5b/email/submission-confirmation", async (c) => {
  try {
    const body = await c.req.json();
    const { studentEmail, studentName, assessmentTitle, submissionDate, viewUrl } = body;

    if (!studentEmail || !studentName || !assessmentTitle) {
      return c.json({ error: 'Missing required fields: studentEmail, studentName, assessmentTitle' }, 400);
    }

    const html = submissionConfirmationTemplate({
      studentName,
      assessmentTitle,
      submissionDate: submissionDate || new Date().toLocaleDateString(),
      viewUrl: viewUrl || '#',
    });

    const result = await sendEmail({
      to: studentEmail,
      subject: `Submission Confirmed: ${assessmentTitle}`,
      html,
    });

    console.log('Submission confirmation email sent successfully:', result);
    return c.json({ success: true, message: 'Email sent successfully', emailId: result.id });
  } catch (error) {
    console.error('Error sending submission confirmation email:', error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

// Email endpoint: Send direct message
app.post("/make-server-ec7aca5b/email/direct-message", async (c) => {
  try {
    const body = await c.req.json();
    const { recipientEmail, recipientName, senderName, senderRole, subject, message, replyUrl } = body;

    if (!recipientEmail || !recipientName || !senderName || !subject || !message) {
      return c.json({ error: 'Missing required fields: recipientEmail, recipientName, senderName, subject, message' }, 400);
    }

    const html = directMessageTemplate({
      recipientName,
      senderName,
      senderRole: senderRole || 'User',
      subject,
      message,
      replyUrl: replyUrl || '#',
    });

    const result = await sendEmail({
      to: recipientEmail,
      subject: `Message from ${senderName}: ${subject}`,
      html,
    });

    console.log('Direct message email sent successfully:', result);
    return c.json({ success: true, message: 'Email sent successfully', emailId: result.id });
  } catch (error) {
    console.error('Error sending direct message email:', error);
    return c.json({ error: `Failed to send email: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);