const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectFile,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { uploadProjectFile } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', roleGuard('admin', 'supervisor'), createProject);
router.put('/:id', roleGuard('admin', 'supervisor'), updateProject);
router.delete('/:id', roleGuard('admin', 'supervisor'), deleteProject);
router.post('/:id/files', roleGuard('admin'), uploadProjectFile.single('file'), addProjectFile);

module.exports = router;