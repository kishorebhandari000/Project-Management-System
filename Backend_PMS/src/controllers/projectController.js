const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, members } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const project = await Project.create({
    name,
    description,
    status,
    members,
    owner: req.user._id,
  });

  res.status(201).json(project);
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  res.json(projects);
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  if (String(project.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Only the owner can update this project' });
  }

  const { name, description, status, members } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (members !== undefined) project.members = members;

  await project.save();
  res.json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  if (String(project.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Only the owner can delete this project' });
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject };
