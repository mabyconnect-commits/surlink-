const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateSettings
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/settings', protect, updateSettings);

module.exports = router;
