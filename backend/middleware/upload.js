/**
 * File Upload Middleware
 * Handles multipart/form-data image uploads with validation
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_FILE_SIZE = (process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024; // Default 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename: timestamp-randomhash-originalext
    const ext = path.extname(file.originalname);
    const hash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${hash}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} allowed`), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 6 // Maximum 6 files per request
  }
});

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        ok: false,
        message: 'Too many files. Maximum 6 files allowed'
      });
    }
    return res.status(400).json({
      ok: false,
      message: `Upload error: ${err.message}`
    });
  }
  if (err) {
    return res.status(400).json({
      ok: false,
      message: err.message
    });
  }
  next();
};

module.exports = { upload, handleUploadError };
