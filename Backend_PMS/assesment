const asyncHandler = require('../utils/asyncHandler');
const Assessment = require('../models/Assessment');
const sendNotification = require('../utils/notify');

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// @desc   Admin creates an assessment and assigns it to a student
// @route  POST /api/assessments
// @access Private/Admin
const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, project, student, supervisor, dueDate } = req.body;

  if (!title || !project || !student || !supervisor) {
    return res.status(400).json({ message: 'title, project, student and supervisor are required' });
  }

  const assessment = await Assessment.create({
    title,
    description,
    project,
    student,
    supervisor,
    dueDate,
  });

  // Notify student
  await sendNotification(req.app, {
    userId: student,
    email: req.body.studentEmail || '',
    title: 'New Assessment Assigned',
    message: `You have been assigned a new assessment: "${title}"`,
  }).catch(() => {});

  res.status(201).json({ assessment });
});

// @desc   Admin gets all assessments
// @route  GET /api/assessments/all
// @access Private/Admin
const getAllAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find()
    .populate('student', 'name email')
    .populate('supervisor', 'name email')
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  res.json({ count: assessments.length, assessments });
});

// ─── STUDENT ─────────────────────────────────────────────────────────────────

// @desc   Student gets their own assessments
// @route  GET /api/assessments/my
// @access Private/Student
const getMyAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ student: req.user._id })
    .populate('supervisor', 'name email')
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  res.json({ count: assessments.length, assessments });
});

// @desc   Student submits an assessment
// @route  PUT /api/assessments/:id/submit
// @access Private/Student
const submitAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  if (String(assessment.student) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to submit this assessment' });
  }

  if (assessment.status === 'graded') {
    return res.status(400).json({ message: 'Assessment already graded' });
  }

  const { submissionText } = req.body;
  if (!submissionText || !submissionText.trim()) {
    return res.status(400).json({ message: 'submissionText is required' });
  }

  assessment.submissionText = submissionText;
  assessment.submittedAt = new Date();
  assessment.status = 'submitted';
  await assessment.save();

  // Notify supervisor
  const populated = await assessment.populate('supervisor', 'name email');
  await sendNotification(req.app, {
    userId: assessment.supervisor._id,
    email: assessment.supervisor.email,
    title: 'Assessment Submitted',
    message: `${req.user.name} has submitted "${assessment.title}" for review.`,
  }).catch(() => {});

  res.json({ assessment });
});

// ─── SUPERVISOR ──────────────────────────────────────────────────────────────

// @desc   Supervisor gets assessments assigned to them
// @route  GET /api/assessments/supervisor
// @access Private/Supervisor
const getSupervisorAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ supervisor: req.user._id })
    .populate('student', 'name email')
    .populate('project', 'name')
    .sort({ createdAt: -1 });

  res.json({ count: assessments.length, assessments });
});

// @desc   Supervisor grades an assessment
// @route  PUT /api/assessments/:id/grade
// @access Private/Supervisor
const gradeAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);

  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  if (String(assessment.supervisor) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to grade this assessment' });
  }

  if (assessment.status !== 'submitted') {
    return res.status(400).json({ message: 'Assessment must be submitted before grading' });
  }

  const { mark, feedback } = req.body;

  if (mark === undefined || mark === null) {
    return res.status(400).json({ message: 'mark is required' });
  }

  if (mark < 0 || mark > 100) {
    return res.status(400).json({ message: 'mark must be between 0 and 100' });
  }

  assessment.mark = mark;
  assessment.feedback = feedback || '';
  assessment.status = 'graded';
  await assessment.save();

  // Notify student
  const populated = await assessment.populate('student', 'name email');
  await sendNotification(req.app, {
    userId: assessment.student._id,
    email: assessment.student.email,
    title: 'Assessment Graded',
    message: `Your assessment "${assessment.title}" has been graded: ${mark}/100`,
  }).catch(() => {});

  res.json({ assessment });
});

module.exports = {
  createAssessment,
  getAllAssessments,
  getMyAssessments,
  submitAssessment,
  getSupervisorAssessments,
  gradeAssessment,
};
