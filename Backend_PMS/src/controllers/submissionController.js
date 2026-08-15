const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const AssessmentVisibility = require('../models/AssessmentVisibility');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');
const { resolveFileUrl, cleanupUploadedFile } = require('../config/cloudinary');

// @desc   Student uploads a file for an assessment currently visible on their
//         project. Resubmitting before grading replaces the existing file.
// @route  POST /api/submissions
// @access Private/Student
const createSubmission = asyncHandler(async (req, res) => {
  const { assessmentId } = req.body;
  if (!assessmentId) {
    return res.status(400).json({ message: 'assessmentId is required' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'A file is required' });
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    cleanupUploadedFile(req.file);
    return res.status(404).json({ message: 'Assessment not found' });
  }

  // Replaces the old "assessment.student === me" check now that Assessment is
  // a shared template - a student may submit only while it's actually visible
  // on their current approved project.
  const allocation = await Allocation.findOne({ student: req.user._id, status: 'approved' });
  const visibility = allocation
    ? await AssessmentVisibility.findOne({ assessment: assessmentId, project: allocation.project, visible: true })
    : null;

  if (!visibility) {
    cleanupUploadedFile(req.file);
    return res.status(403).json({ message: 'This assessment is not currently visible to you' });
  }

  let submission = await Submission.findOne({ assessment: assessmentId, student: req.user._id });

  if (submission && submission.status === 'graded') {
    cleanupUploadedFile(req.file);
    return res.status(400).json({ message: 'This assessment has already been graded' });
  }

  const fileUrl = resolveFileUrl(req, req.file, 'submissions');

  if (submission) {
    submission.fileUrl = fileUrl;
    submission.fileName = req.file.originalname;
    submission.submittedAt = new Date();
    submission.status = 'submitted';
    await submission.save();
  } else {
    submission = await Submission.create({
      assessment: assessmentId,
      student: req.user._id,
      fileUrl,
      fileName: req.file.originalname,
    });
  }

  // Notify the project's CURRENT supervisor (live lookup) - Assessment no
  // longer carries its own supervisor field now that it's a shared template.
  const project = await Project.findById(allocation.project).select('supervisor');
  if (project?.supervisor) {
    await createNotification({
      user: project.supervisor,
      type: 'submission_created',
      title: 'New Submission',
      message: `${req.user.name} submitted a file for "${assessment.title}"`,
      link: '/supervisor/assessments',
    }).catch(() => {});
  }

  await submission.populate([
    { path: 'assessment', select: 'title dueDate files category' },
    { path: 'student', select: 'name email' },
  ]);

  res.status(201).json({ submission });
});

// @desc   List submissions - role-scoped (student: own, supervisor: from
//         students currently approved on one of their projects, admin: all)
// @route  GET /api/submissions
// @access Private
const getSubmissions = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'student') {
    filter.student = req.user._id;
  } else if (req.user.role === 'supervisor') {
    // Scope by the project's CURRENT supervisor, not any stored snapshot -
    // Assessment no longer has its own supervisor field to filter on.
    const myProjectIds = await Project.find({ supervisor: req.user._id }).distinct('_id');
    const myStudentIds = await Allocation.find({
      project: { $in: myProjectIds },
      status: 'approved',
    }).distinct('student');
    filter.student = { $in: myStudentIds };
  }
  // admin: no filter, sees all

  const submissions = await Submission.find(filter)
    .populate({ path: 'assessment', select: 'title dueDate files category' })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: submissions.length, submissions });
});

// @desc   Supervisor grades a submission - authorized via the submitting
//         student's CURRENT approved project's supervisor (live lookup),
//         with admin as a fallback.
// @route  PUT /api/submissions/:id/grade
// @access Private/Supervisor,Admin
const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate('assessment');
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  const allocation = await Allocation.findOne({ student: submission.student, status: 'approved' }).populate(
    'project',
    'supervisor'
  );
  const isOwner =
    allocation?.project?.supervisor && allocation.project.supervisor.toString() === req.user._id.toString();

  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to grade this submission' });
  }

  const { marks, feedback } = req.body;
  if (marks === undefined || marks === null || isNaN(marks)) {
    return res.status(400).json({ message: 'marks is required' });
  }
  if (marks < 0 || marks > 100) {
    return res.status(400).json({ message: 'marks must be between 0 and 100' });
  }

  submission.marks = marks;
  submission.feedback = feedback || '';
  submission.status = 'graded';
  submission.gradedAt = new Date();
  await submission.save();

  await createNotification({
    user: submission.student,
    type: 'assessment_graded',
    title: 'Assessment Graded',
    message: `Your submission for "${submission.assessment.title}" has been graded: ${marks}/100`,
    link: '/student/assessments',
  }).catch(() => {});

  await submission.populate([
    { path: 'assessment', select: 'title dueDate files category' },
    { path: 'student', select: 'name email' },
  ]);

  res.json({ submission });
});

module.exports = { createSubmission, getSubmissions, gradeSubmission };
