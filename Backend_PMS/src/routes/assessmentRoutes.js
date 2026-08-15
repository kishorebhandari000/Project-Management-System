const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { uploadAssessmentFile } = require('../middleware/upload');
const {
  createAssessment,
  addAssessmentFile,
  getAllAssessments,
  getMyAssessments,
  getSupervisorAssessments,
  setAssessmentVisibility,
} = require('../controllers/assessmentController');

// Admin
router.post('/', protect, roleGuard('admin'), createAssessment);
router.post('/:id/files', protect, roleGuard('admin'), uploadAssessmentFile.single('file'), addAssessmentFile);
router.get('/all', protect, roleGuard('admin'), getAllAssessments);

// Student
router.get('/my', protect, roleGuard('student'), getMyAssessments);

// Supervisor
router.get('/supervisor', protect, roleGuard('supervisor'), getSupervisorAssessments);

// Admin + Supervisor
router.put('/:id/visibility', protect, roleGuard('admin', 'supervisor'), setAssessmentVisibility);

module.exports = router;
