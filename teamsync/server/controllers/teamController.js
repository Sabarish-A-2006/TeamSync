const Team = require('../models/Team');
const User = require('../models/User');
const crypto = require('crypto');

const generateInviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

exports.createTeam = async (req, res, next) => {
  try {
    const { teamName, description, department } = req.body;
    if (!teamName) return res.status(400).json({ success: false, message: 'Team name is required' });
    const inviteCode = generateInviteCode();
    const team = await Team.create({
      teamName, description, department,
      createdBy: req.user._id,
      members: [req.user._id],
      inviteCode,
    });
    await User.findByIdAndUpdate(req.user._id, { teamId: team._id });
    res.status(201).json({ success: true, message: 'Team created successfully', data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('members', 'fullName email profileImage isAvailable availabilityStatus designation')
      .populate('createdBy', 'fullName email');
    res.status(200).json({ success: true, data: { teams } });
  } catch (error) {
    next(error);
  }
};

exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'fullName email profileImage isAvailable availabilityStatus designation department lastActiveAt')
      .populate('createdBy', 'fullName email');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const { teamName, description, department } = req.body;
    const team = await Team.findByIdAndUpdate(req.params.id, { teamName, description, department }, { new: true, runValidators: true });
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.status(200).json({ success: true, message: 'Team updated', data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    await User.updateMany({ teamId: team._id }, { teamId: null });
    await team.deleteOne();
    res.status(200).json({ success: true, message: 'Team deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const team = await Team.findByIdAndUpdate(req.params.id, { $addToSet: { members: userId } }, { new: true });
    await User.findByIdAndUpdate(userId, { teamId: team._id });
    res.status(200).json({ success: true, message: 'Member added', data: { team } });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, { $pull: { members: req.params.userId } }, { new: true });
    await User.findByIdAndUpdate(req.params.userId, { teamId: null });
    res.status(200).json({ success: true, message: 'Member removed', data: { team } });
  } catch (error) {
    next(error);
  }
};
