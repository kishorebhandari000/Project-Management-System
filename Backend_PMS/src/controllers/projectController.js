const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Assessment = require('../models/Assessment');
const Group = require('../models/Group');
const { MAX_GROUPS_PER_PROJECT } = require('./groupController');
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

  // approvedCount drives whether a project is actually full (locks out new
  // applications) - only seats an admin has finalized count toward it.
  const seatCounts = await Allocation.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) }, status: 'approved' } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);
  const seatCountByProject = new Map(seatCounts.map((s) => [s._id.toString(), s.count]));

  // For students, surface every pending group that still has open seats, so
  // the frontend can offer "join this group" alongside starting a new one -
  // several groups can be in flight for the same project at once. appliedCount
  // is the total distinct students across any non-rejected group, purely for
  // an at-a-glance "how much interest" display (0/maxStudents if none yet).
  let openGroupsByProject = new Map();
  let appliedByProject = new Map();
  let groupCountByProject = new Map();
  if (req.user.role === 'student') {
    const activeGroups = await Group.find({
      project: { $in: projects.map((p) => p._id) },
      status: { $in: ['pending', 'supervisor_approved', 'approved'] },
    })
      .select('project name status members')
      .lean();

    const maxStudentsByProject = new Map(projects.map((p) => [p._id.toString(), p.maxStudents]));
    for (const g of activeGroups) {
      const key = g.project.toString();

      const appliedSet = appliedByProject.get(key) || new Set();
      g.members.forEach((m) => appliedSet.add(m.toString()));
      appliedByProject.set(key, appliedSet);

      groupCountByProject.set(key, (groupCountByProject.get(key) || 0) + 1);

      // Joinable while pending OR supervisor-recommended but not yet finally
      // decided by the admin - see OPEN_GROUP_STATUSES in groupController.js.
      if (g.status !== 'pending' && g.status !== 'supervisor_approved') continue;
      const maxStudents = maxStudentsByProject.get(key);
      if (g.members.length >= maxStudents) continue;
      const list = openGroupsByProject.get(key) || [];
      list.push({ id: g._id, name: g.name, memberCount: g.members.length });
      openGroupsByProject.set(key, list);
    }
  }

  const projectsWithSeats = projects.map((p) => {
    const key = p._id.toString();
    return {
      ...p.toObject(),
      approvedCount: seatCountByProject.get(key) || 0,
      appliedCount: appliedByProject.get(key)?.size || 0,
      openGroups: openGroupsByProject.get(key) || [],
      groupCount: groupCountByProject.get(key) || 0,
      maxGroupsPerProject: MAX_GROUPS_PER_PROJECT,
    };
  });

  res.json({ count: projectsWithSeats.length, projects: projectsWithSeats });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('supervisor', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ project });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  // Supervisors can view their projects but only an admin may edit them
  // (this includes reassigning the supervisor).
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can update this project' });
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

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can delete this project' });
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