const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Assessment = require('../models/Assessment');
const { resolveFileUrl } = require('../config/cloudinary');

// @desc   Create a project - admin only, admin picks the supervisor
// @route  POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description, category, supervisorId, maxStudents } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const supervisor = supervisorId;
  if (!supervisor) {
    return res.status(400).json({ message: 'supervisorId is required' });
  }

  const project = await Project.create({
    title,
    description,
    category,
    supervisor,
    createdBy: req.user._id,
    maxStudents: maxStudents || 1,
  });

  res.status(201).json({ project });
});

// @desc   List projects - students only see open ones by default, supervisors see their own by default
// @route  GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  else if (req.user.role === 'student') filter.status = 'open';

  if (req.query.supervisor) filter.supervisor = req.query.supervisor;
  else if (req.user.role === 'supervisor') filter.supervisor = req.user._id;

  const projects = await Project.find(filter)
    .populate('supervisor', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: projects.length, projects });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('supervisor', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const isOwner = !!project.supervisor && project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to update this project' });
  }

  Object.assign(project, req.body);
  // Backfill fields that predate this schema (legacy records created before
  // createdBy/status existed) so editing one repairs it instead of failing
  // validation forever on fields the edit form has no way to touch.
  if (!project.createdBy) project.createdBy = req.user._id;
  if (!['open', 'allocated', 'closed'].includes(project.status)) project.status = 'open';
  await project.save();
  res.json({ project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const isOwner = !!project.supervisor && project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to delete this project' });
  }

  const [allocationCount, assessmentCount] = await Promise.all([
    Allocation.countDocuments({ project: project._id }),
    Assessment.countDocuments({ project: project._id }),
  ]);

  if (allocationCount > 0 || assessmentCount > 0) {
    return res.status(409).json({
      message: `Cannot delete: this project has ${allocationCount} allocation(s) and ${assessmentCount} assessment(s) linked to it. Remove those first.`,
      allocationCount,
      assessmentCount,
    });
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

// for file uploading
// @desc   Admin uploads a file to a project
// @route  POST /api/projects/:id/files
const addProjectFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  project.files.push({ url: resolveFileUrl(req, req.file, 'project-files'), name: req.file.originalname });
  await project.save();

  res.status(201).json({ project });
});
module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, addProjectFile };