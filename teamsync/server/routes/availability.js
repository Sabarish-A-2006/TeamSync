const express = require('express');
const router = express.Router();
const { getAvailability, getAvailabilityByUserId, updateAvailability, getAvailabilityHistory } = require('../controllers/availabilityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAvailability);
router.get('/history', protect, getAvailabilityHistory);
router.get('/:userId', protect, getAvailabilityByUserId);
router.patch('/:userId', protect, updateAvailability);

module.exports = router;
