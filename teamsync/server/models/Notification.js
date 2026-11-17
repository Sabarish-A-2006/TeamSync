const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    type: { type: String, enum: ['availability_change', 'team_update', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
