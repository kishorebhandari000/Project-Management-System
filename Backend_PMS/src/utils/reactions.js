const ALLOWED_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢'];

// Toggles emoji on doc.reactions for this user: adds it if absent, removes it if already there.
// Mutates doc.reactions in place; caller is responsible for doc.save().
function toggleReaction(doc, userId, emoji) {
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    const err = new Error('Invalid emoji');
    err.statusCode = 400;
    throw err;
  }

  const idx = doc.reactions.findIndex((r) => r.emoji === emoji && String(r.user) === String(userId));
  if (idx >= 0) {
    doc.reactions.splice(idx, 1);
  } else {
    doc.reactions.push({ emoji, user: userId });
  }
}

module.exports = { ALLOWED_EMOJIS, toggleReaction };
