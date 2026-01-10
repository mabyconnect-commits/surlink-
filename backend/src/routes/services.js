const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  getServicesByCategory
} = require('../controllers/servicesController');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getService);

// Protected routes (Provider only)
router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider'), deleteService);

module.exports = router;
