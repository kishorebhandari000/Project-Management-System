const Allocation = require('../models/Allocation');
const Group = require('../models/Group');

// A student is "already committed" if, on ANY project, they have an approved
// allocation (actually enrolled) or are a member of a still-in-flight group
// request (status pending or supervisor_approved - a request that hasn't been
// finalized or rejected yet). A finalized ('approved') group is already covered
// by the allocation check, since finalizing a group creates approved allocations.
async function getCommittedStudentIds(studentIds) {
  if (!studentIds.length) return new Set();

  const [allocatedIds, groupedIds] = await Promise.all([
    Allocation.find({ student: { $in: studentIds }, status: 'approved' }).distinct('student'),
    Group.find({
      members: { $in: studentIds },
      status: { $in: ['pending', 'supervisor_approved'] },
    }).distinct('members'),
  ]);

  return new Set([...allocatedIds, ...groupedIds].map(String));
}

module.exports = { getCommittedStudentIds };
