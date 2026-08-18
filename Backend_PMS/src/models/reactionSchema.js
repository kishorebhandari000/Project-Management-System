const mongoose = require('mongoose');

// Shared subdocument schema for emoji reactions on forum/discussion content.
const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

module.exports = reactionSchema;
