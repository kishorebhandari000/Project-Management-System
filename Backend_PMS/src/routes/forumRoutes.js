const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  getComments,
  createComment,
  deletePost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

// Forum is public-facing (visible on homepage) - only mutations require auth.
router.route('/').get(getPosts).post(protect, roleGuard('admin'), createPost);
router.route('/:id').get(getPost).delete(protect, roleGuard('admin'), deletePost);
router.route('/:id/comments').get(getComments).post(protect, createComment);

module.exports = router;
