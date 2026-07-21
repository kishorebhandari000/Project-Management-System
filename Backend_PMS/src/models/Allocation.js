const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

allocationSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Allocation', allocationSchema);