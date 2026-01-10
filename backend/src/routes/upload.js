const express = require('express');
const { protect } = require('../middleware/auth');
const {
  uploadSingle,
  uploadMultiple
} = require('../utils/upload');
const {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileUrl
} = require('../controllers/uploadController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload single file
// POST /api/upload/single
// Body: file (form-data)
// Query params: folder (optional)
router.post('/single', uploadSingle('file'), uploadFile);

// Upload multiple files
// POST /api/upload/multiple
// Body: files[] (form-data, max 5 files)
// Query params: folder (optional)
router.post('/multiple', uploadMultiple('files', 5), uploadMultipleFiles);

// Delete file
// DELETE /api/upload/:filePath
// Params: filePath (URL encoded file path)
router.delete('/', deleteFile);

// Get signed URL for private files
// GET /api/upload/signed-url
// Query params: filePath, expiresIn (optional, default 3600)
router.get('/signed-url', getFileUrl);

module.exports = router;
