const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipientId: req.user._id }).populate('senderId', 'fullName profileImage').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments({ recipientId: req.user._id }),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
    ]);
    res.status(200).json({ success: true, data: { notifications, unreadCount: unread, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
