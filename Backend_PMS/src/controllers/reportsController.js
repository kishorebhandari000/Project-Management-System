const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc   System-wide statistics for the admin Reports page
// @route  GET /api/reports/summary
// @access Private/Admin
const getSummary = asyncHandler(async (req, res) => {
  const [totalProjects, totalStudents, totalSupervisors, allocations, assessments, submissions, categoryAgg] =
    await Promise.all([
      Project.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      Allocation.find().select('status'),
      Assessment.find().select('title'),
      Submission.find().select('assessment status marks'),
      Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

  const approvedAllocations = allocations.filter((a) => a.status === 'approved').length;
  const completionRate = allocations.length
    ? Math.round((approvedAllocations / allocations.length) * 100)
    : 0;

  // Actual submit/grade status lives on Submission (one per assessment+student),
  // which is what the student/supervisor UI reads and writes - Assessment itself
  // is only the assignment record, so status is derived from here.
  const submissionByAssessment = new Map(submissions.map((s) => [String(s.assessment), s]));

  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const avgGrade = gradedSubmissions.length
    ? Math.round(
        (gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0) / gradedSubmissions.length) * 10
      ) / 10
    : 0;

  const pendingReviews = submissions.filter((s) => s.status === 'submitted').length;

  // Group by title - the same assessment is typically assigned to many
  // students, so "submissions" is out of how many were assigned that title.
  const byTitle = new Map();
  for (const a of assessments) {
    const entry = byTitle.get(a.title) || { title: a.title, submitted: 0, total: 0 };
    entry.total += 1;
    if (submissionByAssessment.has(String(a._id))) entry.submitted += 1;
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
