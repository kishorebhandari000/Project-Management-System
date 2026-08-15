const mongoose = require('mongoose');

// A shared assessment template - not tied to any one student, supervisor, or
// project. Per-project release is controlled separately via
// AssessmentVisibility; per-student grading lives entirely on Submission.
const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    dueDate: { type: Date },
    files: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
