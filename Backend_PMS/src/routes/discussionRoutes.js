const express = require('express');
const {
  createThread,
  getThreads,
  getThread,
  updateThread,
  deleteThread,
  createPost,
  getPosts,
  updatePost,
  deletePost,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Discussions are private to project members - every route requires login,
// and the controller enforces per-project access (admin, supervisor, or an
// approved Allocation) on top of that.
router.use(protect);

router.route('/').get(getThreads).post(createThread);
router.route('/:id').get(getThread).put(updateThread).delete(deleteThread);
router.route('/:id/posts').get(getPosts).post(createPost);
router.route('/:id/posts/:postId').put(updatePost).delete(deletePost);

module.exports = router;
