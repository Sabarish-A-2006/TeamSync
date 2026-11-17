const mongoose = require('mongoose');

const availabilityHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String, enum: ['available', 'unavailable', 'away'] },
    newStatus: { type: String, enum: ['available', 'unavailable', 'away'], required: true },
    previousAvailability: { type: Boolean },
    newAvailability: { type: Boolean, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '', trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

availabilityHistorySchema.index({ userId: 1 });
availabilityHistorySchema.index({ changedAt: -1 });
availabilityHistorySchema.index({ userId: 1, changedAt: -1 });

module.exports = mongoose.model('AvailabilityHistory', availabilityHistorySchema);
