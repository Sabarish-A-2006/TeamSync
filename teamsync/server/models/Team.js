const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: [true, 'Team name is required'], trim: true },
    description: { type: String, default: '', trim: true },
    department: { type: String, default: '', trim: true },
    inviteCode: { type: String, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

teamSchema.index({ teamName: 1 });

module.exports = mongoose.model('Team', teamSchema);
