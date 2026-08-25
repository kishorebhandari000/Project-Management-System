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
    // Who set the current status via decideGroup - lets a supervisor undo
    // their own not-yet-finalized decision (reject, or recommend-to-admin)
    // without also allowing them to undo someone else's (e.g. an admin's
    // rejection of a forwarded group).
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Reason given for the pending-stage decision (recommend or reject) -
    // shown to the admin alongside the group when recommended, or to the
    // students when rejected.
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);