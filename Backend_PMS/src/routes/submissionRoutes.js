const express = require('express');
const { createSubmission, getSubmissions, gradeSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { uploadSubmissionFile } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', getSubmissions);
router.post('/', roleGuard('student'), uploadSubmissionFile.single('file'), createSubmission);
router.put('/:id/grade', roleGuard('supervisor'), gradeSubmission);

module.exports = router;
