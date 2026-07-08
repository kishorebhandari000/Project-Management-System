const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

async function assertProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  const isMember =
    String(project.owner) === String(userId) ||
    project.members.some((m) => String(m) === String(userId));
  if (!isMember) {
    const err = new Error('Not authorized for this project');
    err.statusCode = 403;
    throw err;
  }
  return project;
}

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignee } = req.body;
  if (!title || !project) {
    return res.status(400).json({ message: 'title and project are required' });
  }

  await assertProjectAccess(project, req.user._id);

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    project,
    assignee,
    createdBy: req.user._id,
  });

  res.status(201).json(task);
});

const getTasks = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) {
    return res.status(400).json({ message: 'project query param is required' });
  }

  await assertProjectAccess(project, req.user._id);

  const tasks = await Task.find({ project })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(tasks);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await assertProjectAccess(task.project, req.user._id);
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await assertProjectAccess(task.project, req.user._id);

  const { title, description, status, priority, dueDate, assignee } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignee !== undefined) task.assignee = assignee;

  await task.save();
  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await assertProjectAccess(task.project, req.user._id);

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
