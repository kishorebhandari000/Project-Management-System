const multer = require('multer');
const { projectFileStorage } = require('../config/cloudinary');

const uploadProjectFile = multer({
  storage: projectFileStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

module.exports = { uploadProjectFile };