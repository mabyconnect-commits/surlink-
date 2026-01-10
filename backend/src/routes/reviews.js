const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createReview,
  getProviderReviews,
  getBookingReview,
  updateReview,
  deleteReview,
  getMyReviews
} = require('../controllers/reviewsController');

const router = express.Router();

// Public routes
router.get('/provider/:id', getProviderReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/my-reviews', getMyReviews);
router.get('/booking/:id', getBookingReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
