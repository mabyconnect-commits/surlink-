const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  getBooking,
  acceptBooking,
  startBooking,
  completeBooking,
  cancelBooking
} = require('../controllers/bookingsController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// General routes
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);

// Provider actions
router.put('/:id/accept', authorize('provider'), acceptBooking);
router.put('/:id/start', authorize('provider'), startBooking);
router.put('/:id/complete', authorize('provider'), completeBooking);

// Cancel (both customer and provider can cancel)
router.put('/:id/cancel', cancelBooking);

module.exports = router;
