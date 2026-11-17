const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
