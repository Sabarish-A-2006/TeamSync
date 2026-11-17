const User = require('../models/User');
const Team = require('../models/Team');
const { generateToken } = require('../config/jwt');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, message, token, data: { user: userObj } });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, teamInviteCode, designation, department } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide fullName, email and password' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check if first user - make them admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'member';

    let teamId = null;
    if (teamInviteCode) {
      const team = await Team.findOne({ inviteCode: teamInviteCode });
      if (team) {
        teamId = team._id;
      }
    }

    const user = await User.create({
      fullName, email, password, designation: designation || '', department: department || '',
      teamId, role,
    });

    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { $addToSet: { members: user._id } });
    }

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password').populate('teamId', 'teamName');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('teamId', 'teamName description department inviteCode');
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
