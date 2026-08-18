const mongoose = require('mongoose');
const reactionSchema = require('./reactionSchema');

const discussionPostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true },
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiscussionPost', discussionPostSchema);
