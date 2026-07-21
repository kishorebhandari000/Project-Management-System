const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const projectFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pms/project-files',
    resource_type: 'auto', // allows pdf/doc/zip, not just images
  },
});

module.exports = { cloudinary, projectFileStorage };