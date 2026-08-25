const Assessment = require('../models/Assessment');
const AssessmentVisibility = require('../models/AssessmentVisibility');
const AssessmentReminder = require('../models/AssessmentReminder');
const Allocation = require('../models/Allocation');
const Submission = require('../models/Submission');
const { createNotification } = require('../controllers/notificationController');

const REMINDER_DAYS_BEFORE = 5;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly is frequent enough - reminders are deduped by day-level thresholds anyway

// For every assessment currently visible on a project, notifies each
// approved (not-yet-submitted) student once when the effective due date
// (extendedDueDate if set, else the template's own dueDate) is within
// REMINDER_DAYS_BEFORE days, and again once it's passed. AssessmentReminder
// rows make each notification fire-once regardless of how often this runs.
async function checkAssessmentReminders() {
  const now = new Date();
  const dueSoonThreshold = new Date(now.getTime() + REMINDER_DAYS_BEFORE * 24 * 60 * 60 * 1000);

  const visRecords = await AssessmentVisibility.find({ visible: true })
    .populate('assessment')
    .populate('project', 'title');

  for (const vis of visRecords) {
    const assessment = vis.assessment;
    if (!assessment || !vis.project) continue;

    const dueDate = vis.extendedDueDate || assessment.dueDate;
    if (!dueDate) continue;

    const isOverdue = dueDate.getTime() <= now.getTime();
    const isDueSoon = !isOverdue && dueDate.getTime() <= dueSoonThreshold.getTime();
    if (!isOverdue && !isDueSoon) continue;

    const type = isOverdue ? 'overdue' : 'due_soon';

    const allocations = await Allocation.find({ project: vis.project._id, status: 'approved' }).populate(
      'student',
      'name email'
    );
    const students = allocations.map((a) => a.student).filter(Boolean);
    if (students.length === 0) continue;

    const submittedIds = new Set(
      (
        await Submission.find({
          assessment: assessment._id,
          student: { $in: students.map((s) => s._id) },
        }).distinct('student')
      ).map(String)
    );

    for (const student of students) {
      if (submittedIds.has(String(student._id))) continue;

      const alreadySent = await AssessmentReminder.findOne({
        assessment: assessment._id,
        project: vis.project._id,
        student: student._id,
        type,
      });
      if (alreadySent) continue;

      const dateLabel = dueDate.toLocaleDateString();
      const message =
        type === 'overdue'
          ? `"${assessment.title}" was due on ${dateLabel} and you haven't submitted it yet.`
          : `"${assessment.title}" is due on ${dateLabel} - ${REMINDER_DAYS_BEFORE} days from now.`;

      await createNotification({
        user: student._id,
        type: type === 'overdue' ? 'assessment_overdue' : 'assessment_due_soon',
        title: type === 'overdue' ? 'Assessment Overdue' : 'Assessment Due Soon',
        message,
        link: '/student/assessments',
      }).catch(() => {});

      await AssessmentReminder.create({
        assessment: assessment._id,
        project: vis.project._id,
        student: student._id,
        type,
      }).catch(() => {});
    }
  }
}

function startAssessmentReminderJob() {
  checkAssessmentReminders().catch((err) => console.error('Assessment reminder check failed:', err));
  setInterval(() => {
    checkAssessmentReminders().catch((err) => console.error('Assessment reminder check failed:', err));
  }, CHECK_INTERVAL_MS);
}

module.exports = { startAssessmentReminderJob, checkAssessmentReminders };
