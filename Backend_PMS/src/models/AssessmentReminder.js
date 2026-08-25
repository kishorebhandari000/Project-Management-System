const mongoose = require('mongoose');

// One row per (assessment, project, student, type) reminder that has already
// been sent - lets the periodic reminder job run as often as it wants
// without ever notifying the same student twice for the same milestone.
const assessmentReminderSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['due_soon', 'overdue'], required: true },
  },
  { timestamps: true }
);

assessmentReminderSchema.index({ assessment: 1, project: 1, student: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentReminder', assessmentReminderSchema);
