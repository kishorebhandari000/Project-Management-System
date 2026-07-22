const mongoose = require('mongoose');
const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');
const asyncHandler = require('../utils/asyncHandler');

const createPost = asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'title and body are required' });
  }

  const post = await ForumPost.create({
    title,
    body,
    createdBy: req.user._id,
  });

  res.status(201).json(post);
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await ForumPost.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(posts);
});

const getPost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await ForumPost.findById(req.params.id).populate('createdBy', 'name email');

  if (!post) {
    return res.status(404).json({ message: 'Forum post not found' });
  }

  res.json(post);
});

const getComments = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await ForumPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Forum post not found' });
  }

  const comments = await ForumComment.find({ post: post._id })
    .populate('author', 'name email')
    .sort({ createdAt: 1 });

  res.json(comments);
});

const createComment = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body) {
    return res.status(400).json({ message: 'body is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await ForumPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Forum post not found' });
  }

  const comment = await ForumComment.create({
    body,
    post: post._id,
    author: req.user._id,
  });

  res.status(201).json(comment);
});

const deletePost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post id' });
  }

  const post = await ForumPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Forum post not found' });
  }

  await ForumComment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Forum post deleted' });
});

module.exports = { createPost, getPosts, getPost, getComments, createComment, deletePost };
