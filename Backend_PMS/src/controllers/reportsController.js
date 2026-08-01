const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

// @desc   System-wide statistics for the admin Reports page
// @route  GET /api/reports/summary
// @access Private/Admin
const getSummary = asyncHandler(async (req, res) => {
  const [totalProjects, totalStudents, totalSupervisors, allocations, assessments, categoryAgg] =
    await Promise.all([
      Project.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      Allocation.find().select('status'),
      Assessment.find().select('title mark status'),
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

  const approvedAllocations = allocations.filter((a) => a.status === 'approved').length;
  const completionRate = allocations.length
    ? Math.round((approvedAllocations / allocations.length) * 100)
    : 0;

  const gradedAssessments = assessments.filter((a) => a.status === 'graded');
  const avgGrade = gradedAssessments.length
    ? Math.round(
        (gradedAssessments.reduce((sum, a) => sum + (a.mark || 0), 0) / gradedAssessments.length) * 10
      ) / 10
    : 0;

  const pendingReviews = assessments.filter((a) => a.status === 'submitted').length;

  // Group by title - the same assessment is typically assigned to many
  // students, so "submissions" is out of how many were assigned that title.
  const byTitle = new Map();
  for (const a of assessments) {
    const entry = byTitle.get(a.title) || { title: a.title, submitted: 0, total: 0 };
    entry.total += 1;
    if (a.status !== 'not_submitted') entry.submitted += 1;
    byTitle.set(a.title, entry);
  }
  const assessmentStats = [...byTitle.values()].map((s) => ({
    ...s,
    percentage: s.total ? Math.round((s.submitted / s.total) * 100) : 0,
  }));

  const projectCategories = categoryAgg.map((c) => ({
    category: c._id || 'Uncategorized',
    count: c.count,
  }));

  res.json({
    totalProjects,
    totalStudents,
    totalSupervisors,
    completionRate,
    avgGrade,
    pendingReviews,
    assessmentStats,
    projectCategories,
  });
});

module.exports = { getSummary };
