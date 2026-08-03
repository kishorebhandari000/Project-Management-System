const asyncHandler = require('../utils/asyncHandler');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const sendNotification = require('../utils/notify');
const { createNotification } = require('./notificationController');

// @desc   Student proposes a group and applies to a project together
// @route  POST /api/groups
// @access Private/Student
const createGroup = asyncHandler(async (req, res) => {
  const { project: projectId, name, memberIds = [] } = req.body; // memberIds: array of User _id strings, selected via dropdown

  if (!projectId) {
    return res.status(400).json({ message: 'project is required' });
  }

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (project.status !== 'open') {
    return res.status(409).json({ message: 'This project is not open for applications' });
  }

  const memberSet = new Set([req.user._id.toString(), ...memberIds.map(String)]);
  const members = Array.from(memberSet);

  const validMembers = await User.countDocuments({ _id: { $in: members }, role: 'student' });
  if (validMembers !== members.length) {
    return res.status(400).json({ message: 'One or more selected teammates are not valid students' });
  }

  if (members.length > project.maxStudents) {
    return res.status(400).json({
      message: `This project allows a maximum of ${project.maxStudents} student(s), you selected ${members.length}`,
    });
  }

  // Prevent a student from having another active (pending/approved) group on this same project
  const existing = await Group.findOne({
    project: projectId,
    members: { $in: members },
    status: { $in: ['pending', 'approved'] },
  });
  if (existing) {
    return res.status(409).json({ message: 'One or more selected students already have an active group request for this project' });
  }

  const group = await Group.create({
    project: projectId,
    name: name || '',
    supervisor: project.supervisor,
    leader: req.user._id,
    members,
  });

  const supervisorUser = await User.findById(project.supervisor);
  if (supervisorUser) {
    await sendNotification(req.app, {
      userId: supervisorUser._id,
      email: supervisorUser.email,
      title: 'New group request',
      message: `${req.user.name} submitted a group of ${members.length} for "${project.title}"`,
    }).catch(() => {});
  }

  res.status(201).json({ group });
});

// @desc   Student sees the groups they're a member of
// @route  GET /api/groups/my
// @access Private/Student
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('project', 'title status maxStudents')
    .populate('members', 'name email studentId')
    .populate('leader', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: groups.length, groups });
});

// @desc   Supervisor/Admin lists group requests (supervisor sees own, admin sees all)
// @route  GET /api/groups
// @access Private/Supervisor,Admin
const getGroups = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  if (req.user.role === 'supervisor') {
    // Scope by the project's current supervisor, not the supervisor snapshot
    // stored on the group - see the same fix in allocationController.js.
    const myProjectIds = await Project.find({ supervisor: req.user._id }).distinct('_id');
    filter.project = { $in: myProjectIds };
  }

  const groups = await Group.find(filter)
    .populate('project', 'title status maxStudents')
    .populate('members', 'name email studentId')
    .populate('leader', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: groups.length, groups });
});

// Locks in allocations for every member of a group, once it has final
// (admin) approval. Returns { ok: false, message } if there isn't enough
// room left on the project; otherwise finalizes the group and returns
// { ok: true }.
async function finalizeGroupAllocation(group) {
  const approvedSeats = await Allocation.countDocuments({
    project: group.project._id,
    status: 'approved',
  });
  if (approvedSeats + group.members.length > group.project.maxStudents) {
    return { ok: false, message: 'Not enough open seats left on this project for the whole group' };
  }

  for (const memberId of group.members) {
    await Allocation.findOneAndUpdate(
      { project: group.project._id, student: memberId },
      {
        project: group.project._id,
        student: memberId,
        supervisor: group.project.supervisor,
        status: 'approved',
        decidedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  const newApprovedCount = approvedSeats + group.members.length;
  if (newApprovedCount >= group.project.maxStudents) {
    await Project.findByIdAndUpdate(group.project._id, { status: 'allocated' });
  }

  group.status = 'approved';
  group.decidedAt = new Date();
  group.supervisor = group.project.supervisor;
  await group.save();

  return { ok: true };
}

async function notifyMembers(group, decision) {
  const memberUsers = await User.find({ _id: { $in: group.members } });
  for (const memberUser of memberUsers) {
    await sendNotification(null, {
      userId: memberUser._id,
      email: memberUser.email,
      title: `Group request ${decision}`,
      message: `Your group request for "${group.project.title}" was ${decision}.`,
    }).catch(() => {});
  }
}

// @desc   Supervisor recommends/rejects a pending group, or admin gives the
//         final allocation decision on a group the supervisor already
//         recommended. Two-stage workflow:
//           pending -> (supervisor decides) -> supervisor_approved -> (admin decides) -> approved
//         An admin can also act directly on a still-pending group as a
//         fallback, in which case it skips straight to a final decision.
// @route  PUT /api/groups/:id/decision
// @access Private/Supervisor,Admin
const decideGroup = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
  }

  const group = await Group.findById(req.params.id).populate('project', 'title maxStudents supervisor');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.project) {
    return res.status(409).json({ message: 'This group\'s project no longer exists' });
  }

  const isOwner = group.project.supervisor && group.project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to decide on this group' });
  }

  if (group.status === 'pending') {
    if (decision === 'rejected') {
      group.status = 'rejected';
      group.decidedAt = new Date();
      await group.save();
      await notifyMembers(group, 'rejected');
      return res.json({ group });
    }

    if (req.user.role === 'admin') {
      // Admin fallback: no need to wait on the supervisor, finalize now.
      const result = await finalizeGroupAllocation(group);
      if (!result.ok) return res.status(409).json({ message: result.message });
      await notifyMembers(group, 'approved');
      return res.json({ group });
    }

    // Supervisor recommendation: forward to admin, don't lock in seats yet.
    group.status = 'supervisor_approved';
    group.decidedAt = new Date();
    await group.save();

    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          user: admin._id,
          type: 'group_forwarded',
          title: 'Group recommended for allocation',
          message: `A supervisor recommended a group of ${group.members.length} for "${group.project.title}" - final allocation needed`,
          link: '/admin/allocation',
        })
      )
    );

    return res.json({ group });
  }

  if (group.status === 'supervisor_approved') {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only an admin can give the final allocation decision' });
    }

    if (decision === 'rejected') {
      group.status = 'rejected';
      group.decidedAt = new Date();
      await group.save();
      await notifyMembers(group, 'rejected');
      return res.json({ group });
    }

    const result = await finalizeGroupAllocation(group);
    if (!result.ok) return res.status(409).json({ message: result.message });
    await notifyMembers(group, 'approved');
    return res.json({ group });
  }

  return res.status(400).json({ message: 'This group has already been decided on' });
});

// @desc   Admin/Supervisor edits the membership of an existing group (add/remove students)
// @route  PUT /api/groups/:id/members
// @access Private/Supervisor,Admin
const updateGroupMembers = asyncHandler(async (req, res) => {
  const { memberIds = [] } = req.body;

  const group = await Group.findById(req.params.id).populate('project', 'title maxStudents supervisor');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.project) {
    return res.status(409).json({ message: 'This group\'s project no longer exists' });
  }

  const isOwner = group.project.supervisor && group.project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to edit this group' });
  }

  const newMembers = Array.from(new Set(memberIds.map(String)));
  if (newMembers.length > group.project.maxStudents) {
    return res.status(400).json({ message: `This project allows a maximum of ${group.project.maxStudents} student(s)` });
  }

  const oldMembers = group.members.map(String);
  const added = newMembers.filter((id) => !oldMembers.includes(id));
  const removed = oldMembers.filter((id) => !newMembers.includes(id));

  if (group.status === 'approved') {
    for (const memberId of removed) {
      await Allocation.findOneAndDelete({ project: group.project._id, student: memberId });
    }
    for (const memberId of added) {
      await Allocation.findOneAndUpdate(
        { project: group.project._id, student: memberId },
        {
          project: group.project._id,
          student: memberId,
          supervisor: group.project.supervisor,
          status: 'approved',
          decidedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    await Project.findByIdAndUpdate(group.project._id, {
      status: newMembers.length >= group.project.maxStudents ? 'allocated' : 'open',
    });
  }

  group.members = newMembers;
  await group.save();

  res.json({ group });
});

// @desc   Student withdraws their own pending group request
// @route  DELETE /api/groups/:id
// @access Private/Student
const withdrawGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });

  if (group.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the group leader can withdraw this request' });
  }
  if (group.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending group requests can be withdrawn' });
  }

  await group.deleteOne();
  res.json({ message: 'Group request withdrawn' });
});

module.exports = {
  createGroup,
  getMyGroups,
  getGroups,
  decideGroup,
  updateGroupMembers,
  withdrawGroup,
};