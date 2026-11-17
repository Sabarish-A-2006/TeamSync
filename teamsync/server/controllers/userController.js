const User = require('../models/User');
const Team = require('../models/Team');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, department, teamId, page = 1, limit = 20, sort = 'fullName' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = { $regex: department, $options: 'i' };
    if (teamId) query.teamId = teamId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    if (sort === 'name') sortObj.fullName = 1;
    else if (sort === 'recent') sortObj.updatedAt = -1;
    else if (sort === 'status') sortObj.availabilityStatus = 1;
    else sortObj.fullName = 1;

    const [users, total] = await Promise.all([
      User.find(query).populate('teamId', 'teamName').sort(sortObj).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('teamId', 'teamName description department');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const isOwner = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }
    const allowedFields = ['fullName', 'designation', 'department', 'profileImage', 'statusMessage', 'workingHours', 'timezone'];
    if (isAdmin) allowedFields.push('role', 'teamId');
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('teamId', 'teamName');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.teamId) {
      await Team.findByIdAndUpdate(user.teamId, { $pull: { members: user._id } });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
