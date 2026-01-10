const {
  uploadToSupabase,
  deleteFromSupabase,
  getSignedUrl
} = require('../utils/upload');

/**
 * @desc    Upload single file
 * @route   POST /api/upload/single
 * @access  Private
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Get folder from query params or use default
    const folder = req.query.folder || 'uploads';
    const userId = req.user.id;

    // Upload to Supabase
    const result = await uploadToSupabase(req.file, folder, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        path: result.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
exports.uploadMultipleFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    // Get folder from query params or use default
    const folder = req.query.folder || 'uploads';
    const userId = req.user.id;

    // Upload all files to Supabase
    const uploadPromises = req.files.map(file =>
      uploadToSupabase(file, folder, userId)
    );

    const results = await Promise.all(uploadPromises);

    // Check if any uploads failed
    const failed = results.filter(r => !r.success);
    const successful = results.filter(r => r.success);

    if (failed.length > 0 && successful.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'All file uploads failed',
        errors: failed.map(f => f.error)
      });
    }

    // Format successful uploads
    const uploadedFiles = successful.map((result, index) => {
      const file = req.files[index];
      return {
        url: result.url,
        path: result.path,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      };
    });

    res.status(200).json({
      success: true,
      message: `${successful.length} file(s) uploaded successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
      data: {
        files: uploadedFiles,
        count: successful.length,
        failed: failed.length > 0 ? failed.map(f => f.error) : undefined
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};

/**
 * @desc    Delete file from storage
 * @route   DELETE /api/upload
 * @access  Private
 */
exports.deleteFile = async (req, res, next) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Delete from Supabase
    const result = await deleteFromSupabase(filePath);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'File deletion failed',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: {
        path: filePath
      }
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

/**
 * @desc    Get signed URL for private file
 * @route   GET /api/upload/signed-url
 * @access  Private
 */
exports.getFileUrl = async (req, res, next) => {
  try {
    const { filePath, expiresIn } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Get signed URL
    const expirationTime = expiresIn ? parseInt(expiresIn) : 3600; // Default 1 hour
    const result = await getSignedUrl(filePath, expirationTime);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Signed URL generated successfully',
      data: {
        url: result.url,
        expiresIn: expirationTime
      }
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating signed URL',
      error: error.message
    });
  }
};
