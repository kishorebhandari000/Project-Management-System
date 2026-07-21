const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    submissionText: { type: String, trim: true, default: '' },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['not_submitted', 'submitted', 'graded'],
      default: 'not_submitted',
    },
    mark: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
