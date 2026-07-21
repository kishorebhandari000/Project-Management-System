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

router.use(protect);

router.route('/').post(roleGuard('admin'), createPost).get(getPosts);
router.route('/:id').get(getPost).delete(roleGuard('admin'), deletePost);
router.route('/:id/comments').get(getComments).post(createComment);

module.exports = router;
