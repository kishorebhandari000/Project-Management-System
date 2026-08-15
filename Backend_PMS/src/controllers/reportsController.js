const asyncHandler = require('../utils/asyncHandler');
const Project = require('../models/Project');
const Allocation = require('../models/Allocation');
const Assessment = require('../models/Assessment');
const AssessmentVisibility = require('../models/AssessmentVisibility');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc   System-wide statistics for the admin Reports page
// @route  GET /api/reports/summary
// @access Private/Admin
const getSummary = asyncHandler(async (req, res) => {
  const [
    totalProjects,
    totalStudents,
    totalSupervisors,
    allocations,
    assessments,
    visibilities,
    submissions,
    categoryAgg,
  ] = await Promise.all([
    Project.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'supervisor' }),
    Allocation.find().select('status student project'),
    Assessment.find().select('title'),
    AssessmentVisibility.find({ visible: true }).select('assessment project'),
    Submission.find().select('assessment student status marks'),
    Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const approvedAllocations = allocations.filter((a) => a.status === 'approved');
  const completionRate = allocations.length
    ? Math.round((approvedAllocations.length / allocations.length) * 100)
    : 0;

  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const avgGrade = gradedSubmissions.length
    ? Math.round(
        (gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0) / gradedSubmissions.length) * 10
      ) / 10
    : 0;

  const pendingReviews = submissions.filter((s) => s.status === 'submitted').length;

  // Students currently approved on each project - the pool an assessment
  // template actually reaches once it's released (visible: true) there.
  const studentsByProject = new Map();
  for (const a of approvedAllocations) {
    const key = String(a.project);
    if (!studentsByProject.has(key)) studentsByProject.set(key, new Set());
    studentsByProject.get(key).add(String(a.student));
  }

  // Which projects each assessment template is currently released to.
  const visibleProjectsByAssessment = new Map();
  for (const v of visibilities) {
    const key = String(v.assessment);
    if (!visibleProjectsByAssessment.has(key)) visibleProjectsByAssessment.set(key, new Set());
    visibleProjectsByAssessment.get(key).add(String(v.project));
  }

  const submissionsByAssessment = new Map();
  for (const s of submissions) {
    const key = String(s.assessment);
    if (!submissionsByAssessment.has(key)) submissionsByAssessment.set(key, []);
    submissionsByAssessment.get(key).push(s);
  }

  // One row per assessment template (no more grouping by title - that was
  // only needed back when one template = many per-student Assessment docs).
  // "released" is the actual reach of the template: unique students on
  // projects it's currently visible to. "submitted" counts any Submission
  // from a released student regardless of status, so it includes graded ones
  // (a graded submission was, at some point, submitted) - "graded" is then
  // the subset of "submitted" that's been marked.
  const assessmentStats = assessments.map((a) => {
    const key = String(a._id);
    const visibleProjectIds = visibleProjectsByAssessment.get(key) || new Set();

    const releasedStudents = new Set();
    for (const projectId of visibleProjectIds) {
      const students = studentsByProject.get(projectId);
      if (students) for (const studentId of students) releasedStudents.add(studentId);
    }
    const released = releasedStudents.size;

    const assessmentSubmissions = (submissionsByAssessment.get(key) || []).filter((s) =>
      releasedStudents.has(String(s.student))
    );
    const submitted = assessmentSubmissions.length;
    const graded = assessmentSubmissions.filter((s) => s.status === 'graded').length;

    return {
      title: a.title,
      released,
      submitted,
      graded,
      percentage: released ? Math.round((submitted / released) * 100) : 0,
    };
  });

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
