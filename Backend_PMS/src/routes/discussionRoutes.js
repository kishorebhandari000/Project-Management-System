const express = require('express');
const { createThread, getThreads, getThread, getPosts, createPost } = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').post(createThread).get(getThreads);
router.route('/:id').get(getThread);
router.route('/:id/posts').get(getPosts).post(createPost);

module.exports = router;
