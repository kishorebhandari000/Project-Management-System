const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, trim: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    maxStudents: { type: Number, default: 1 },
    status: { type: String, enum: ['open', 'allocated', 'closed'], default: 'open' },
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

module.exports = mongoose.model('Project', projectSchema);