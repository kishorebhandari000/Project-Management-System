const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    status: { type: String, enum: ['pending', 'supervisor_approved', 'approved', 'rejected'], default: 'pending' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);