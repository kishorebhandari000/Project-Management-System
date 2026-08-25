const asyncHandler = require('../utils/asyncHandler');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { getCommittedStudentIds } = require('../utils/studentCommitment');
const { appendGroupSubmission } = require('../utils/googleSheets');
const { refreshProjectStatus } = require('./allocationController');

// A project can have at most this many groups in flight (or approved) at
// once - beyond that, students must join one of the existing groups instead
// of starting a new one. Rejected groups don't count against the cap.
const MAX_GROUPS_PER_PROJECT = 2;

// Logs one row to the GroupForm Google Sheet tab per event - a full-roster
// row when the group is first created, and a single-student delta row for
// every later join/leave - so the sheet reads as an event log instead of
// something that gets rewritten (and needs a row number tracked) on every
// membership change. Best-effort: a Sheets outage never blocks the
// underlying group action, since these are always called fire-and-forget.
async function logGroupSheetRow(groupId, { memberNames, memberStudentIds, status }) {
  try {
    const group = await Group.findById(groupId)
      .populate('project', 'title')
      .populate('supervisor', 'name')
      .populate('leader', 'name');
    if (!group) return;

    await appendGroupSubmission({
      groupName: group.name,
      projectTitle: group.project?.title || '',
      supervisorName: group.supervisor?.name,
      leaderName: group.leader?.name || '',
      memberNames,
      memberStudentIds,
      status: status ?? group.status,
    });
  } catch {
    // best-effort, see comment above
  }
}

// Logs the group's full current roster as one row - used for events that
// affect the whole group at once (creation, an admin undoing the final
// allocation) rather than a single student joining or leaving.
async function logGroupSnapshot(groupId) {
  try {
    const group = await Group.findById(groupId);
    if (!group) return;
    const members = await User.find({ _id: { $in: group.members } }).select('name studentId');
    await logGroupSheetRow(groupId, {
      memberNames: members.map((u) => u.name),
      memberStudentIds: members.map((u) => u.studentId || ''),
    });
  } catch {
    // best-effort, see comment on logGroupSheetRow above
  }
}

async function logGroupMembershipChange(groupId, student, action) {
  const marker = action === 'joined' ? '+' : '-';
  await logGroupSheetRow(groupId, {
    memberNames: [`${marker} ${student.name}`],
    memberStudentIds: [student.studentId || ''],
  });
}

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

  const existingGroupCount = await Group.countDocuments({ project: projectId, status: { $ne: 'rejected' } });
  if (existingGroupCount >= MAX_GROUPS_PER_PROJECT) {
    return res.status(409).json({
      message: `This project already has ${MAX_GROUPS_PER_PROJECT} groups - join one of them instead of starting a new one`,
    });
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

  // Every selected member (including the leader) must not already be committed
  // elsewhere - via an approved allocation, or an in-flight group request on ANY
  // project (this subsumes the old same-project-only check, since a pending/
  // supervisor_approved group on this same project is also "committed").
  const committedIds = await getCommittedStudentIds(members);
  if (committedIds.size > 0) {
    const committedUsers = await User.find({ _id: { $in: Array.from(committedIds) } }).select('name');
    const names = committedUsers.map((u) => u.name).join(', ');
    return res.status(409).json({
      message: `${names} ${committedUsers.length > 1 ? 'are' : 'is'} already committed to another project and can't join this group`,
    });
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
    await createNotification({
      user: supervisorUser._id,
      type: 'group_created',
      title: 'New group request',
      message: `${req.user.name} submitted a group of ${members.length} for "${project.title}"`,
      link: '/supervisor/projects',
    }).catch(() => {});
  }

  logGroupSnapshot(group._id);

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

async function notifyMembers(group, decision, comment) {
  const memberUsers = await User.find({ _id: { $in: group.members } });
  const reasonSuffix = comment ? ` Reason: ${comment}` : '';
  for (const memberUser of memberUsers) {
    await createNotification({
      user: memberUser._id,
      type: 'group_decision',
      title: `Group request ${decision}`,
      message: `Your group request for "${group.project.title}" was ${decision}.${reasonSuffix}`,
      link: '/student/projects',
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
  const { decision, comment } = req.body; // 'approved' | 'rejected'; comment: reason shown to the admin (recommend) or the students (reject)
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
    group.comment = comment || '';

    if (decision === 'rejected') {
      group.status = 'rejected';
      group.decidedAt = new Date();
      group.decidedBy = req.user._id;
      await group.save();
      await notifyMembers(group, 'rejected', group.comment);
      return res.json({ group });
    }

    if (req.user.role === 'admin') {
      // Admin fallback: no need to wait on the supervisor, finalize now.
      const result = await finalizeGroupAllocation(group);
      if (!result.ok) return res.status(409).json({ message: result.message });
      await notifyMembers(group, 'approved', group.comment);
      return res.json({ group });
    }

    // Supervisor recommendation: forward to admin, don't lock in seats yet.
    group.status = 'supervisor_approved';
    group.decidedAt = new Date();
    group.decidedBy = req.user._id;
    await group.save();

    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          user: admin._id,
          type: 'group_forwarded',
          title: 'Group recommended for allocation',
          message: `A supervisor recommended a group of ${group.members.length} for "${group.project.title}" - final allocation needed${group.comment ? ` (Note: ${group.comment})` : ''}`,
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
      group.decidedBy = req.user._id;
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

// @desc   Supervisor cancels their own not-yet-finalized decision on a group
//         (a rejection, or a recommendation forwarded to admin) and sends it
//         back to 'pending' for a fresh look. Only undoes a decision the
//         calling supervisor themselves made - not one an admin made (e.g.
//         an admin rejecting a forwarded group), and not a finalized
//         allocation (use undoGroupAllocation for that).
// @route  PUT /api/groups/:id/undo-decision
// @access Private/Supervisor
const undoGroupDecision = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('project', 'title supervisor');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.project) {
    return res.status(409).json({ message: 'This group\'s project no longer exists' });
  }

  const isOwner = group.project.supervisor && group.project.supervisor.toString() === req.user._id.toString();
  if (!isOwner) {
    return res.status(403).json({ message: 'Not authorized to undo this decision' });
  }

  if (!['rejected', 'supervisor_approved'].includes(group.status)) {
    return res.status(400).json({ message: 'Only a rejection or a recommendation to admin can be undone' });
  }

  if (!group.decidedBy || group.decidedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only undo a decision you made yourself' });
  }

  group.status = 'pending';
  group.comment = '';
  group.decidedAt = undefined;
  group.decidedBy = undefined;
  await group.save();

  const memberUsers = await User.find({ _id: { $in: group.members } });
  for (const memberUser of memberUsers) {
    await createNotification({
      user: memberUser._id,
      type: 'group_decision',
      title: 'Group decision undone',
      message: `Your supervisor undid their decision on your group request for "${group.project.title}" - it's back under review.`,
      link: '/student/projects',
    }).catch(() => {});
  }

  res.json({ group });
});

// @desc   Admin undoes a finalized ('approved') group allocation - releases
//         the seats it locked in (deletes the Allocation record it created
//         for each member) and sends the group back to 'supervisor_approved'
//         so it reappears in the final-allocation queue for a fresh decision.
// @route  PUT /api/groups/:id/undo
// @access Private/Admin
const undoGroupAllocation = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('project', 'title maxStudents');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.project) {
    return res.status(409).json({ message: 'This group\'s project no longer exists' });
  }
  if (group.status !== 'approved') {
    return res.status(400).json({ message: 'Only a finalized group allocation can be undone' });
  }

  await Allocation.deleteMany({ project: group.project._id, student: { $in: group.members } });

  group.status = 'supervisor_approved';
  group.decidedAt = undefined;
  await group.save();

  await refreshProjectStatus(group.project._id);
  logGroupSnapshot(group._id);

  const memberUsers = await User.find({ _id: { $in: group.members } });
  for (const memberUser of memberUsers) {
    await createNotification({
      user: memberUser._id,
      type: 'group_decision',
      title: 'Group allocation undone',
      message: `An admin undid your group's allocation for "${group.project.title}" - it's awaiting a new decision.`,
      link: '/student/projects',
    }).catch(() => {});
  }

  res.json({ group });
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

// Statuses a student can still join/leave without an admin/supervisor
// decision getting overwritten - once a group is finally 'approved' its
// roster is locked (supervisor/admin must use updateGroupMembers instead).
const OPEN_GROUP_STATUSES = ['pending', 'supervisor_approved'];

// @desc   A non-leader member leaves a group they joined, without cancelling
//         the whole request - only the leader can do that (via withdrawGroup
//         above), since removing the leader would leave the group ownerless.
//         Leaving a 'supervisor_approved' group resets it to 'pending', since
//         the roster the supervisor signed off on no longer matches reality.
// @route  DELETE /api/groups/:id/leave
// @access Private/Student
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('project', 'title');
  if (!group) return res.status(404).json({ message: 'Group not found' });

  if (group.leader.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'As the group leader, withdraw the request instead of leaving it' });
  }
  if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
    return res.status(400).json({ message: 'You are not a member of this group' });
  }
  if (!OPEN_GROUP_STATUSES.includes(group.status)) {
    return res.status(400).json({ message: 'This group has already been decided on and can no longer be left' });
  }

  const wasSupervisorApproved = group.status === 'supervisor_approved';
  group.members = group.members.filter((m) => m.toString() !== req.user._id.toString());
  if (wasSupervisorApproved) {
    group.status = 'pending';
    group.decidedAt = undefined;
  }
  await group.save();
  logGroupMembershipChange(group._id, req.user, 'left');

  if (wasSupervisorApproved) {
    const supervisorUser = await User.findById(group.supervisor);
    if (supervisorUser && group.project) {
      await createNotification({
        user: supervisorUser._id,
        type: 'group_membership_changed',
        title: 'Group membership changed',
        message: `${req.user.name} left a group for "${group.project.title}" after your recommendation - it needs another look`,
        link: '/supervisor/projects',
      }).catch(() => {});
    }
  }

  res.json({ message: 'You left the group' });
});

// @desc   Student joins an existing group that still has open seats, instead
//         of starting a new competing group for the same project. Joining a
//         'supervisor_approved' group resets it to 'pending', since the
//         roster the supervisor signed off on no longer matches reality.
// @route  POST /api/groups/:id/join
// @access Private/Student
const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('project', 'title maxStudents status');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.project) {
    return res.status(409).json({ message: 'This group\'s project no longer exists' });
  }
  if (!OPEN_GROUP_STATUSES.includes(group.status)) {
    return res.status(409).json({ message: 'This group is no longer accepting new members' });
  }
  if (group.project.status !== 'open') {
    return res.status(409).json({ message: 'This project is not open for applications' });
  }
  if (group.members.some((m) => m.toString() === req.user._id.toString())) {
    return res.status(409).json({ message: 'You are already a member of this group' });
  }
  if (group.members.length >= group.project.maxStudents) {
    return res.status(409).json({ message: 'This group is already full' });
  }

  const committedIds = await getCommittedStudentIds([req.user._id.toString()]);
  if (committedIds.size > 0) {
    return res.status(409).json({ message: 'You are already committed to another project and can\'t join this group' });
  }

  const wasSupervisorApproved = group.status === 'supervisor_approved';
  group.members.push(req.user._id);
  if (wasSupervisorApproved) {
    group.status = 'pending';
    group.decidedAt = undefined;
  }
  await group.save();
  logGroupMembershipChange(group._id, req.user, 'joined');

  const leader = await User.findById(group.leader);
  if (leader) {
    await createNotification({
      user: leader._id,
      type: 'group_membership_changed',
      title: 'Someone joined your group',
      message: `${req.user.name} joined your group for "${group.project.title}"`,
      link: '/student/projects',
    }).catch(() => {});
  }

  if (wasSupervisorApproved) {
    const supervisorUser = await User.findById(group.supervisor);
    if (supervisorUser) {
      await createNotification({
        user: supervisorUser._id,
        type: 'group_membership_changed',
        title: 'Group membership changed',
        message: `${req.user.name} joined a group for "${group.project.title}" after your recommendation - it needs another look`,
        link: '/supervisor/projects',
      }).catch(() => {});
    }
  }

  res.json({ group });
});

module.exports = {
  createGroup,
  getMyGroups,
  getGroups,
  decideGroup,
  undoGroupDecision,
  undoGroupAllocation,
  updateGroupMembers,
  withdrawGroup,
  leaveGroup,
  joinGroup,
  MAX_GROUPS_PER_PROJECT,
};