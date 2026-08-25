const asyncHandler = require('../utils/asyncHandler');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');

// Recomputes a project's status from its actual approved-seat count, instead
// of blindly marking it 'allocated' on any single approval - a project with
// maxStudents > 1 must stay 'open' until every seat is filled. Never touches
// a project an admin has manually 'closed'.
async function refreshProjectStatus(projectId) {
  const project = await Project.findById(projectId);
  if (!project || project.status === 'closed') return;

  const approvedCount = await Allocation.countDocuments({ project: projectId, status: 'approved' });
  const newStatus = approvedCount >= project.maxStudents ? 'allocated' : 'open';
  if (project.status !== newStatus) {
    project.status = newStatus;
    await project.save();
  }
}

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
    link: '/supervisor/projects',
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
        link: '/admin/allocation',
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
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === 'supervisor') {
    // Scope by the project's current supervisor, not the supervisor snapshot
    // stored on the allocation - that snapshot goes stale if an admin later
    // reassigns the project to someone else.
    const myProjectIds = await Project.find({ supervisor: req.user._id }).distinct('_id');
    filter.project = { $in: myProjectIds };
  }

  const allocations = await Allocation.find(filter)
    .populate('project', 'title status description maxStudents files')
    .populate('student', 'name email studentId')
    .populate('supervisor', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: allocations.length, allocations });
});

// @desc   Approve or reject a request - the project's supervisor (default) or
//         admin (fallback)
// @route  PUT /api/allocations/:id/decision
const decideAllocation = asyncHandler(async (req, res) => {
  const { decision, comment } = req.body; // decision: 'approved' | 'rejected' | 'pending'; comment: reason shown to the student when rejecting
  if (!['approved', 'rejected', 'pending'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved', 'rejected', or 'pending'" });
  }

  const allocation = await Allocation.findById(req.params.id).populate('project', 'title supervisor');
  if (!allocation) return res.status(404).json({ message: 'Allocation not found' });
  if (!allocation.project) {
    return res.status(409).json({ message: 'This request\'s project no longer exists' });
  }

  // Authorize against the project's CURRENT supervisor, not the supervisor
  // snapshot stored on the allocation - that snapshot is only set once, at
  // request time, and goes stale if an admin later reassigns the project.
  const isOwner = allocation.project.supervisor && allocation.project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Only the project supervisor or an admin can decide on this allocation' });
  }

  allocation.status = decision;
  allocation.decidedAt = decision === 'pending' ? undefined : new Date();
  // A rejection reason only makes sense attached to an actual rejection -
  // clear it out on any other decision so a stale reason can't linger.
  allocation.comment = decision === 'rejected' ? comment || '' : '';
  // Keep the stored snapshot in sync with reality whenever we touch this record.
  allocation.supervisor = allocation.project.supervisor;
  await allocation.save();

  await refreshProjectStatus(allocation.project._id);

  // Only notify the student on a real decision, not on undo
  if (decision !== 'pending') {
    const reasonSuffix = allocation.comment ? ` Reason: ${allocation.comment}` : '';
    await createNotification({
      user: allocation.student,
      type: 'allocation_decision',
      title: `Allocation ${decision}`,
      message: `Your request for "${allocation.project.title}" was ${decision}.${reasonSuffix}`,
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
    await refreshProjectStatus(prev.project);
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

  await refreshProjectStatus(project._id);

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

module.exports = { requestAllocation, getAllocations, decideAllocation, forceAssignAllocation, refreshProjectStatus };