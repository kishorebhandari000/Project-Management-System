const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const {
  createAssessment,
  getAllAssessments,
  getMyAssessments,
  submitAssessment,
  getSupervisorAssessments,
  gradeAssessment,
} = require('../controllers/assessmentController');

// Admin
router.post('/', protect, roleGuard('admin'), createAssessment);
router.get('/all', protect, roleGuard('admin'), getAllAssessments);

// Student
router.get('/my', protect, roleGuard('student'), getMyAssessments);
router.put('/:id/submit', protect, roleGuard('student'), submitAssessment);

// Supervisor
router.get('/supervisor', protect, roleGuard('supervisor'), getSupervisorAssessments);
router.put('/:id/grade', protect, roleGuard('supervisor'), gradeAssessment);

module.exports = router;
