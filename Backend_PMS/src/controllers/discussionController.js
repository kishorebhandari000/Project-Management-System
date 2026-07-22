const DiscussionThread = require('../models/DiscussionThread');
const DiscussionPost = require('../models/DiscussionPost');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const asyncHandler = require('../utils/asyncHandler');

// Admin, the project's supervisor, or a student with an approved Allocation on it.
async function assertProjectAccess(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'admin' || String(project.supervisor) === String(user._id)) {
    return project;
  }

  const approved = await Allocation.findOne({
    project: projectId,
    student: user._id,
    status: 'approved',
  });

  if (!approved) {
    const err = new Error('Not authorized for this project');
    err.statusCode = 403;
    throw err;
  }

  return project;
}

async function loadThreadWithProjectAccess(threadId, user) {
  const thread = await DiscussionThread.findById(threadId);
  if (!thread) {
    const err = new Error('Discussion thread not found');
    err.statusCode = 404;
    throw err;
  }
  const project = await assertProjectAccess(thread.project, user);
  return { thread, project };
}

const createThread = asyncHandler(async (req, res) => {
  const { title, content, project, status } = req.body;
  if (!title || !content || !project) {
    return res.status(400).json({ message: 'title, content and project are required' });
  }

  await assertProjectAccess(project, req.user);

  const thread = await DiscussionThread.create({
    title,
    content,
    status,
    project,
    createdBy: req.user._id,
  });

  res.status(201).json(thread);
});

const getThreads = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) {
    return res.status(400).json({ message: 'project query param is required' });
  }

  await assertProjectAccess(project, req.user);

  const threads = await DiscussionThread.find({ project })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(threads);
});

const getThread = asyncHandler(async (req, res) => {
  const { thread } = await loadThreadWithProjectAccess(req.params.id, req.user);
  await thread.populate('createdBy', 'name email');

  const posts = await DiscussionPost.find({ thread: thread._id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: 1 });

  res.json({ thread, posts });
});

const updateThread = asyncHandler(async (req, res) => {
  const { thread } = await loadThreadWithProjectAccess(req.params.id, req.user);

  const isAuthor = String(thread.createdBy) === String(req.user._id);
  if (req.user.role !== 'admin' && !isAuthor) {
    return res.status(403).json({ message: 'Only the author can update this thread' });
  }

  const { title, content, status } = req.body;
  if (title !== undefined) thread.title = title;
  if (content !== undefined) thread.content = content;
  if (status !== undefined) thread.status = status;

  await thread.save();
  res.json(thread);
});

const deleteThread = asyncHandler(async (req, res) => {
  const { thread, project } = await loadThreadWithProjectAccess(req.params.id, req.user);

  const isAuthor = String(thread.createdBy) === String(req.user._id);
  const isSupervisor = String(project.supervisor) === String(req.user._id);
  if (req.user.role !== 'admin' && !isAuthor && !isSupervisor) {
    return res.status(403).json({ message: 'Only the author, the project supervisor, or an admin can delete this thread' });
  }

  await DiscussionPost.deleteMany({ thread: thread._id });
  await thread.deleteOne();
  res.json({ message: 'Discussion thread deleted' });
});

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'content is required' });
  }

  const { thread } = await loadThreadWithProjectAccess(req.params.id, req.user);

  const post = await DiscussionPost.create({
    content,
    thread: thread._id,
    createdBy: req.user._id,
  });

  res.status(201).json(post);
});

const getPosts = asyncHandler(async (req, res) => {
  const { thread } = await loadThreadWithProjectAccess(req.params.id, req.user);

  const posts = await DiscussionPost.find({ thread: thread._id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: 1 });

  res.json(posts);
});

const updatePost = asyncHandler(async (req, res) => {
  await loadThreadWithProjectAccess(req.params.id, req.user);

  const post = await DiscussionPost.findOne({ _id: req.params.postId, thread: req.params.id });
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const isAuthor = String(post.createdBy) === String(req.user._id);
  if (req.user.role !== 'admin' && !isAuthor) {
    return res.status(403).json({ message: 'Only the author can update this post' });
  }

  const { content } = req.body;
  if (content !== undefined) post.content = content;

  await post.save();
  res.json(post);
});

const deletePost = asyncHandler(async (req, res) => {
  const { project } = await loadThreadWithProjectAccess(req.params.id, req.user);

  const post = await DiscussionPost.findOne({ _id: req.params.postId, thread: req.params.id });
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const isAuthor = String(post.createdBy) === String(req.user._id);
  const isSupervisor = String(project.supervisor) === String(req.user._id);
  if (req.user.role !== 'admin' && !isAuthor && !isSupervisor) {
    return res.status(403).json({ message: 'Only the author, the project supervisor, or an admin can delete this post' });
  }

  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

module.exports = {
  createThread,
  getThreads,
  getThread,
  updateThread,
  deleteThread,
  createPost,
  getPosts,
  updatePost,
  deletePost,
};
