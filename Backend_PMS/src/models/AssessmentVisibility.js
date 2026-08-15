const mongoose = require('mongoose');

// One record per (assessment, project) pair - whether that assessment
// template is currently released to that project's students. Absence of a
// record is equivalent to visible: false.
const assessmentVisibilitySchema = new mongoose.Schema(
  {
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    visible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

assessmentVisibilitySchema.index({ assessment: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentVisibility', assessmentVisibilitySchema);
