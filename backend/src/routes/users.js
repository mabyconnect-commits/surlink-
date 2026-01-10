const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProviders,
  getProvider,
  searchUsers
} = require('../controllers/usersController');

const router = express.Router();

// Public routes
router.get('/providers', getProviders);
router.get('/providers/:id', getProvider);

// Protected routes
router.get('/search', protect, searchUsers);

module.exports = router;
