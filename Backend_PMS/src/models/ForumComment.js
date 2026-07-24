const mongoose = require('mongoose');

const forumCommentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumComment', forumCommentSchema);
