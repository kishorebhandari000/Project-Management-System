const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  getComments,
  createComment,
  deletePost,
  deleteComment,
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Forum is public-facing (visible on homepage) - only mutations require auth.
// Any logged-in user (admin, supervisor, student) can start a thread.
router.route('/').get(getPosts).post(protect, createPost);
// Post deletion is admin-or-own-author, enforced in the controller.
router.route('/:id').get(getPost).delete(protect, deletePost);
router.route('/:id/comments').get(getComments).post(protect, createComment);
// Comment deletion is admin-or-own-author, enforced in the controller (not roleGuard'd here).
router.route('/:id/comments/:commentId').delete(protect, deleteComment);

module.exports = router;
