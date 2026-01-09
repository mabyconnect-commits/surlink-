const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Reviews routes - To be fully implemented
router.all('*', protect, async (req, res) => {
  res.json({ 
    success: true, 
    message: 'Reviews API endpoint - Implementation in progress',
    path: req.path,
    method: req.method
  });
});

module.exports = router;
