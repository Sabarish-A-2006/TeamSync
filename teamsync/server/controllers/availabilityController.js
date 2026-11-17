const User = require('../models/User');
const AvailabilityHistory = require('../models/AvailabilityHistory');
const { emitAvailabilityUpdate } = require('../sockets/socketHandler');

// @desc    Get availability for all users
// @route   GET /api/availability
// @access  Private
exports.getAvailability = async (req, res, next) => {
  try {
    const { teamId, department, status } = req.query;
    const query = {};
    if (teamId) query.teamId = teamId;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (status) query.availabilityStatus = status;

    const users = await User.find(query)
      .select('fullName email profileImage designation department teamId isAvailable availabilityStatus statusMessage lastActiveAt')
      .populate('teamId', 'teamName');

    res.status(200).json({ success: true, data: { users, total: users.length } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get availability for a single user
// @route   GET /api/availability/:userId
// @access  Private
exports.getAvailabilityByUserId = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('fullName email profileImage isAvailable availabilityStatus statusMessage lastActiveAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user availability
// @route   PATCH /api/availability/:userId
// @access  Private
exports.updateAvailability = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const isOwner = req.user._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user's availability" });
    }

    const { isAvailable, availabilityStatus, reason } = req.body;
    if (isAvailable === undefined && !availabilityStatus) {
      return res.status(400).json({ success: false, message: 'Provide isAvailable or availabilityStatus' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const previousAvailability = user.isAvailable;
    const previousStatus = user.availabilityStatus;

    // Update - let the pre-save hook keep fields in sync
    if (availabilityStatus !== undefined) {
      user.availabilityStatus = availabilityStatus;
    } else if (isAvailable !== undefined) {
      user.isAvailable = isAvailable;
    }
    user.lastActiveAt = new Date();
    await user.save();

    // Record history
    await AvailabilityHistory.create({
      userId: user._id,
      previousStatus,
      newStatus: user.availabilityStatus,
      previousAvailability,
      newAvailability: user.isAvailable,
      updatedBy: req.user._id,
      reason: reason || '',
    });

    // Emit socket event
    const teamId = user.teamId ? user.teamId.toString() : null;
    emitAvailabilityUpdate(teamId, {
      userId: user._id,
      fullName: user.fullName,
      isAvailable: user.isAvailable,
      availabilityStatus: user.availabilityStatus,
      updatedAt: user.updatedAt,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        userId: user._id,
        isAvailable: user.isAvailable,
        availabilityStatus: user.availabilityStatus,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get availability history
// @route   GET /api/availability/history
// @access  Private
exports.getAvailabilityHistory = async (req, res, next) => {
  try {
    const { userId, status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.newStatus = status;
    if (startDate || endDate) {
      query.changedAt = {};
      if (startDate) query.changedAt.$gte = new Date(startDate);
      if (endDate) query.changedAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [history, total] = await Promise.all([
      AvailabilityHistory.find(query)
        .populate('userId', 'fullName email profileImage')
        .populate('updatedBy', 'fullName email')
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AvailabilityHistory.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { history, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};
