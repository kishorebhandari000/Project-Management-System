const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    marks: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

// A student resubmitting the same assessment updates their existing
// submission rather than creating a duplicate row.
submissionSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
