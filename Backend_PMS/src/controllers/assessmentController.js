const asyncHandler = require('../utils/asyncHandler');
const Assessment = require('../models/Assessment');
const AssessmentVisibility = require('../models/AssessmentVisibility');
const Allocation = require('../models/Allocation');
const Project = require('../models/Project');
const { createNotification } = require('./notificationController');
const { resolveFileUrl } = require('../config/cloudinary');

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// @desc   Admin creates a shared assessment template. It starts hidden from
//         everyone - no notification goes out here, since no AssessmentVisibility
//         record exists yet for any project until a supervisor turns one on.
// @route  POST /api/assessments
// @access Private/Admin
const ASSESSMENT_CATEGORIES = ['tutorial', 'report', 'presentation'];

const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, category } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'title is required' });
  }
  if (!category || !ASSESSMENT_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `category is required and must be one of: ${ASSESSMENT_CATEGORIES.join(', ')}` });
  }

  const assessment = await Assessment.create({ title, description, dueDate, category });

  res.status(201).json({ assessment });
});

// @desc   Admin attaches a file (e.g. an assignment brief) to an assessment template
// @route  POST /api/assessments/:id/files
// @access Private/Admin
const addAssessmentFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

  assessment.files.push({ url: resolveFileUrl(req, req.file, 'assessment-files'), name: req.file.originalname });
  await assessment.save();

  res.status(201).json({ assessment });
});

// @desc   Admin gets every assessment template, with how many projects
//         currently have each one turned on
// @route  GET /api/assessments/all
// @access Private/Admin
const getAllAssessments = asyncHandler(async (req, res) => {
  const [assessments, visibleCounts] = await Promise.all([
    Assessment.find().sort({ createdAt: -1 }),
    AssessmentVisibility.aggregate([
      { $match: { visible: true } },
      { $group: { _id: '$assessment', count: { $sum: 1 } } },
    ]),
  ]);

  const countByAssessment = new Map(visibleCounts.map((v) => [String(v._id), v.count]));

  const assessmentsWithCounts = assessments.map((a) => ({
    ...a.toObject(),
    visibleProjectCount: countByAssessment.get(String(a._id)) || 0,
  }));

  res.json({ count: assessmentsWithCounts.length, assessments: assessmentsWithCounts });
});

// ─── STUDENT ─────────────────────────────────────────────────────────────────

// Assessment templates currently released (visible: true) to a project, with
// each one's dueDate replaced by that project's extended deadline if a
// supervisor has set one - callers should never need to look at the raw
// template date once this has run. originalDueDate/extendedDueDate are also
// included so the frontend can show "extended from X" if it wants to.
async function getVisibleAssessmentsForProject(projectId) {
  if (!projectId) return [];
  const visRecords = await AssessmentVisibility.find({ project: projectId, visible: true }).select(
    'assessment extendedDueDate'
  );
  if (visRecords.length === 0) return [];

  const assessmentIds = visRecords.map((v) => v.assessment);
  const extendedByAssessment = new Map(visRecords.map((v) => [String(v.assessment), v.extendedDueDate || null]));

  const assessments = await Assessment.find({ _id: { $in: assessmentIds } });

  return assessments
    .map((a) => {
      const extendedDueDate = extendedByAssessment.get(String(a._id)) || null;
      return {
        ...a.toObject(),
        dueDate: extendedDueDate || a.dueDate,
        originalDueDate: a.dueDate,
        extendedDueDate,
      };
    })
    .sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aTime - bTime;
    });
}

// @desc   Student gets assessment templates released for their current project
// @route  GET /api/assessments/my
// @access Private/Student
const getMyAssessments = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findOne({ student: req.user._id, status: 'approved' });

  if (!allocation) {
    return res.json({ count: 0, assessments: [], hasApprovedProject: false });
  }

  const assessments = await getVisibleAssessmentsForProject(allocation.project);
  res.json({ count: assessments.length, assessments, hasApprovedProject: true });
});

// ─── SUPERVISOR ──────────────────────────────────────────────────────────────

// @desc   Supervisor sees every assessment template that exists (the full
//         trimester schedule), and for each one the current visibility state
//         for each project they currently supervise (live-looked-up, not a
//         stored snapshot - same pattern used for allocations/groups elsewhere).
// @route  GET /api/assessments/supervisor
// @access Private/Supervisor
const getSupervisorAssessments = asyncHandler(async (req, res) => {
  const myProjects = await Project.find({ supervisor: req.user._id }).select('title');
  const myProjectIds = myProjects.map((p) => p._id);

  const [assessments, visRecords] = await Promise.all([
    Assessment.find().sort({ createdAt: -1 }),
    AssessmentVisibility.find({ project: { $in: myProjectIds } }),
  ]);

  const visibleByKey = new Map(visRecords.map((v) => [`${v.assessment}:${v.project}`, v.visible]));
  const extendedByKey = new Map(visRecords.map((v) => [`${v.assessment}:${v.project}`, v.extendedDueDate || null]));

  const assessmentsWithVisibility = assessments.map((a) => ({
    ...a.toObject(),
    projects: myProjects.map((p) => ({
      _id: p._id,
      title: p.title,
      visible: visibleByKey.get(`${a._id}:${p._id}`) || false,
      extendedDueDate: extendedByKey.get(`${a._id}:${p._id}`) || null,
    })),
  }));

  res.json({ count: assessmentsWithVisibility.length, assessments: assessmentsWithVisibility });
});

// @desc   Toggle whether an assessment template is released to a project's
//         students. Admin can toggle any project; a supervisor can only
//         toggle a project they CURRENTLY supervise (live lookup). Flipping
//         false -> true notifies every student with an approved allocation
//         on that project.
// @route  PUT /api/assessments/:id/visibility
// @access Private/Admin,Supervisor
const setAssessmentVisibility = asyncHandler(async (req, res) => {
  const { projectId, visible } = req.body;
  if (!projectId || typeof visible !== 'boolean') {
    return res.status(400).json({ message: 'projectId and visible (boolean) are required' });
  }

  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const isOwner = project.supervisor && project.supervisor.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'Not authorized to change visibility for this project' });
  }

  const existing = await AssessmentVisibility.findOne({ assessment: assessment._id, project: project._id });
  const wasVisible = existing?.visible || false;

  const visibility = await AssessmentVisibility.findOneAndUpdate(
    { assessment: assessment._id, project: project._id },
    { visible },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (visible && !wasVisible) {
    const approvedAllocations = await Allocation.find({ project: project._id, status: 'approved' }).populate(
      'student',
      'name email'
    );
    await Promise.all(
      approvedAllocations
        .filter((alloc) => alloc.student)
        .map((alloc) =>
          createNotification({
            user: alloc.student._id,
            type: 'assessment_visible',
            title: 'New Assessment Available',
            message: `New assessment available: "${assessment.title}"`,
            link: '/student/assessments',
          }).catch(() => {})
        )
    );
  }

  res.json({ visibility });
});

// @desc   Supervisor extends an assessment's effective deadline for ONE of
//         their own projects only - never the shared template's own dueDate,
//         and never any other project. Admin cannot do this at all (excluded
//         at the route's roleGuard, not just here). Notifies every approved
//         student on that project.
// @route  PUT /api/assessments/:id/extend-deadline
// @access Private/Supervisor
const extendDeadline = asyncHandler(async (req, res) => {
  const { projectId, newDueDate } = req.body;
  if (!projectId || !newDueDate) {
    return res.status(400).json({ message: 'projectId and newDueDate are required' });
  }

  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const isOwner = project.supervisor && project.supervisor.toString() === req.user._id.toString();
  if (!isOwner) {
    return res.status(403).json({ message: 'Only the project supervisor can extend this deadline' });
  }

  if (!assessment.dueDate) {
    return res.status(400).json({ message: 'This assessment has no due date to extend' });
  }

  const parsedNewDate = new Date(newDueDate);
  if (isNaN(parsedNewDate.getTime())) {
    return res.status(400).json({ message: 'newDueDate is not a valid date' });
  }
  if (parsedNewDate.getTime() <= assessment.dueDate.getTime()) {
    return res.status(400).json({ message: 'newDueDate must be strictly after the original due date' });
  }

  const visibility = await AssessmentVisibility.findOneAndUpdate(
    { assessment: assessment._id, project: project._id },
    { extendedDueDate: parsedNewDate },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Only notify if the assessment is actually visible on this project right
  // now - same condition setAssessmentVisibility uses to decide whether to
  // notify. extendedDueDate is still saved either way.
  if (visibility.visible) {
    const approvedAllocations = await Allocation.find({ project: project._id, status: 'approved' }).populate(
      'student',
      'name email'
    );
    await Promise.all(
      approvedAllocations
        .filter((alloc) => alloc.student)
        .map((alloc) =>
          createNotification({
            user: alloc.student._id,
            type: 'deadline_extended',
            title: 'Deadline Extended',
            message: `The deadline for "${assessment.title}" has been extended to ${parsedNewDate.toLocaleDateString()}.`,
            link: '/student/assessments',
          }).catch(() => {})
        )
    );
  }

  res.json({ visibility });
});

module.exports = {
  createAssessment,
  addAssessmentFile,
  getAllAssessments,
  getMyAssessments,
  getSupervisorAssessments,
  setAssessmentVisibility,
  extendDeadline,
};
