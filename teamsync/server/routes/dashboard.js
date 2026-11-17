const express = require('express');
const router = express.Router();
const { getStats, getTeamStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/team-stats', protect, getTeamStats);

module.exports = router;
