const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const sendNotification = require('../utils/notify');
const { resolveFileUrl, cleanupUploadedFile } = require('../config/cloudinary');

// @desc   Student uploads a file for an assessment assigned to them.
//         Resubmitting before grading replaces the existing file.
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

  if (String(assessment.student) !== String(req.user._id)) {
    cleanupUploadedFile(req.file);
    return res.status(403).json({ message: 'This assessment is not assigned to you' });
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

  // Keep the assessment record's own status in sync so admin reports and
  // supervisor pending-review counts (which read Assessment.status) reflect
  // submissions made through this file-upload flow.
  assessment.submittedAt = submission.submittedAt;
  assessment.status = 'submitted';
  await assessment.save();

  const assessmentWithSupervisor = await assessment.populate('supervisor', 'name email');
  await sendNotification(req.app, {
    userId: assessmentWithSupervisor.supervisor._id,
    email: assessmentWithSupervisor.supervisor.email,
    title: 'New Submission',
    message: `${req.user.name} submitted a file for "${assessment.title}"`,
  }).catch(() => {});

  await submission.populate([
    { path: 'assessment', select: 'title dueDate project', populate: { path: 'project', select: 'title' } },
    { path: 'student', select: 'name email' },
  ]);

  res.status(201).json({ submission });
});

// @desc   List submissions - role-scoped (student: own, supervisor: for their
//         assigned assessments, admin: all)
// @route  GET /api/submissions
// @access Private
const getSubmissions = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'student') {
    filter.student = req.user._id;
  } else if (req.user.role === 'supervisor') {
    const assessmentIds = await Assessment.find({ supervisor: req.user._id }).distinct('_id');
    filter.assessment = { $in: assessmentIds };
  }
  // admin: no filter, sees all

  const submissions = await Submission.find(filter)
    .populate({
      path: 'assessment',
      select: 'title dueDate project student supervisor',
      populate: [
        { path: 'project', select: 'title' },
        { path: 'supervisor', select: 'name email' },
      ],
    })
    .populate('student', 'name email')
    .sort({ createdAt: -1 });

  res.json({ count: submissions.length, submissions });
});

// @desc   Supervisor grades a submission for one of their own assessments
// @route  PUT /api/submissions/:id/grade
// @access Private/Supervisor
const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate('assessment');
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  if (String(submission.assessment.supervisor) !== String(req.user._id)) {
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

  submission.assessment.mark = marks;
  submission.assessment.feedback = feedback || '';
  submission.assessment.status = 'graded';
  await submission.assessment.save();

  const studentUser = await submission.populate('student', 'name email');
  await sendNotification(req.app, {
    userId: studentUser.student._id,
    email: studentUser.student.email,
    title: 'Assessment Graded',
    message: `Your submission for "${submission.assessment.title}" has been graded: ${marks}/100`,
  }).catch(() => {});

  await submission.populate([
    { path: 'assessment', select: 'title dueDate project', populate: { path: 'project', select: 'title' } },
    { path: 'student', select: 'name email' },
  ]);

  res.json({ submission });
});

module.exports = { createSubmission, getSubmissions, gradeSubmission };
