const mongoose = require('mongoose');
const reactionSchema = require('./reactionSchema');

const forumPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumPost', forumPostSchema);
