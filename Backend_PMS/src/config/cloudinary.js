const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    'CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET not set - falling back to local disk storage under Backend_PMS/uploads. ' +
      'Add real Cloudinary credentials to .env to switch back to cloud storage (no code changes needed).'
  );
}

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Cloudinary in production; local disk in dev environments that haven't
// configured credentials yet. Whichever is active, callers get a storage
// engine here and resolve the eventual URL via resolveFileUrl() below.
function makeStorage(folder) {
  if (hasCloudinaryCredentials) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `pms/${folder}`,
        resource_type: 'auto', // allows pdf/doc/zip, not just images
      },
    });
  }

  const dir = path.join(UPLOADS_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });
}

// CloudinaryStorage already puts a full URL in file.path; disk storage only
// gives a local filesystem path, so build the equivalent /uploads URL here.
function resolveFileUrl(req, file, folder) {
  if (hasCloudinaryCredentials) return file.path;
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${file.filename}`;
}

// Multer's storage engine runs as request middleware, before a controller's
// own auth/validation checks - so a request that ends up rejected still has
// a file already sitting in Cloudinary/on disk. Call this in each rejection
// branch after `req.file` exists so failed attempts don't leave orphans.
function cleanupUploadedFile(file) {
  if (!file) return;
  if (hasCloudinaryCredentials) {
    cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
  } else {
    fs.unlink(file.path, () => {});
  }
}

const projectFileStorage = makeStorage('project-files');
const submissionFileStorage = makeStorage('submissions');

module.exports = {
  cloudinary,
  projectFileStorage,
  submissionFileStorage,
  resolveFileUrl,
  cleanupUploadedFile,
  usingLocalStorageFallback: !hasCloudinaryCredentials,
  UPLOADS_ROOT,
};
