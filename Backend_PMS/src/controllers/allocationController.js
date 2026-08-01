const asyncHandler = require('../utils/asyncHandler');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// @desc   Student requests to join a project
// @route  POST /api/allocations
const requestAllocation = asyncHandler(async (req, res) => {
  const { projectId } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const existing = await Allocation.findOne({ project: projectId, student: req.user._id });
  if (existing) return res.status(409).json({ message: 'You have already requested this project' });

  const allocation = await Allocation.create({
    project: project._id,
    student: req.user._id,
    supervisor: project.supervisor,
  });

  await createNotification({
    user: project.supervisor,
    type: 'allocation_request',
    title: 'New allocation request',
    message: `${req.user.name} requested to join "${project.title}"`,
    link: '/supervisor/allocations',
  });

  // Also notify all admins
  const User = require('../models/User');
  const admins = await User.find({ role: 'admin' });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        user: admin._id,
        type: 'allocation_request',
        title: 'New allocation request',
        message: `${req.user.name} requested to join "${project.title}"`,
        link: '/admin/allocations',
      })
    )
  );

  res.status(201).json({ allocation });
});

// @desc   List allocations - role-scoped
// @route  GET /api/allocations
const getAllocations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.user.role === 'supervisor') filter.supervisor = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const allocations = await Allocation.find(filter)
    .populate('project', 'title status description maxStudents files')
    .populate('student', 'name email')
    .populate('supervisor', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: allocations.length, allocations });
});

// @desc   Approve or reject a request - the project's supervisor (default) or
//         admin (fallback)
// @route  PUT /api/allocations/:id/decision
const decideAllocation = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected' | 'pending'
  if (!['approved', 'rejected', 'pending'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved', 'rejected', or 'pending'" });
  }

  const allocation = await Allocation.findById(req.params.id).populate('project', 'title');
  if (!allocation) return res.status(404).json({ message: 'Allocation not found' });

  const isOwner = allocation.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Only the project supervisor or an admin can decide on this allocation' });
  }

  const wasApproved = allocation.status === 'approved';

  allocation.status = decision;
  allocation.decidedAt = decision === 'pending' ? undefined : new Date();
  await allocation.save();

  if (decision === 'approved') {
    await Project.findByIdAndUpdate(allocation.project._id, { status: 'allocated' });
  } else if (wasApproved && decision !== 'approved') {
    // Reverting a previously-approved allocation reopens the project
    await Project.findByIdAndUpdate(allocation.project._id, { status: 'open' });
  }

  // Only notify the student on a real decision, not on undo
  if (decision !== 'pending') {
    await createNotification({
      user: allocation.student,
      type: 'allocation_decision',
      title: `Allocation ${decision}`,
      message: `Your request for "${allocation.project.title}" was ${decision}.`,
      link: '/student/projects',
    });
  }

  res.json({ allocation });
});

// @desc   Admin safety-net override: directly assign/reassign a student to a
//         project. Creates (or updates) an allocation already set to
//         'approved'. Any other approved allocation the student holds is
//         cleared so the student ends up on exactly one project.
// @route  POST /api/allocations/assign
const forceAssignAllocation = asyncHandler(async (req, res) => {
  const { projectId, studentId } = req.body;
  if (!projectId || !studentId) {
    return res.status(400).json({ message: 'projectId and studentId are required' });
  }

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const User = require('../models/User');
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(400).json({ message: 'studentId must belong to a student' });
  }

  const previousApproved = await Allocation.find({
    student: studentId,
    status: 'approved',
    project: { $ne: projectId },
  });
  for (const prev of previousApproved) {
    prev.status = 'rejected';
    prev.decidedAt = new Date();
    await prev.save();
    await Project.findByIdAndUpdate(prev.project, { status: 'open' });
  }

  let allocation = await Allocation.findOne({ project: projectId, student: studentId });
  if (allocation) {
    allocation.status = 'approved';
    allocation.supervisor = project.supervisor;
    allocation.decidedAt = new Date();
    await allocation.save();
  } else {
    allocation = await Allocation.create({
      project: project._id,
      student: student._id,
      supervisor: project.supervisor,
      status: 'approved',
      decidedAt: new Date(),
    });
  }

  await Project.findByIdAndUpdate(project._id, { status: 'allocated' });

  await createNotification({
    user: student._id,
    type: 'allocation_decision',
    title: 'Allocation approved',
    message: `An admin assigned you to "${project.title}".`,
    link: '/student/projects',
  });

  await allocation.populate([
    { path: 'project', select: 'title status description maxStudents files' },
    { path: 'student', select: 'name email' },
    { path: 'supervisor', select: 'name email' },
  ]);

  res.status(201).json({ allocation });
});

module.exports = { requestAllocation, getAllocations, decideAllocation, forceAssignAllocation };