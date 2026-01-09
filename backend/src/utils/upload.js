const multer = require('multer');
const path = require('path');
const { supabase } = require('../config/supabase');

// Multer storage configuration (memory storage for Supabase)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: fileFilter
});

// Upload to Supabase Storage
exports.uploadToSupabase = async (file, folder = 'uploads', userId = null) => {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'surlink-uploads';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${folder}/${userId || 'public'}/${timestamp}-${randomStr}${path.extname(file.originalname)}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete from Supabase Storage
exports.deleteFromSupabase = async (filePath) => {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'surlink-uploads';

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

// Get signed URL for private files
exports.getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'surlink-uploads';

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Signed URL error:', error);
    return { success: false, error: error.message };
  }
};

// Export multer upload
exports.upload = upload;

// Upload middleware configurations
exports.uploadSingle = (fieldName) => upload.single(fieldName);
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
exports.uploadFields = (fields) => upload.fields(fields);
