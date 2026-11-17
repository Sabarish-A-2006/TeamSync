const User = require('../models/User');
const AvailabilityHistory = require('../models/AvailabilityHistory');
const Team = require('../models/Team');

exports.getStats = async (req, res, next) => {
  try {
    const [total, available, unavailable, away, recentActivity] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ availabilityStatus: 'available' }),
      User.countDocuments({ availabilityStatus: 'unavailable' }),
      User.countDocuments({ availabilityStatus: 'away' }),
      AvailabilityHistory.find().sort({ changedAt: -1 }).limit(10)
        .populate('userId', 'fullName email profileImage')
        .populate('updatedBy', 'fullName'),
    ]);
    const availabilityPercentage = total > 0 ? Math.round((available / total) * 100) : 0;
    res.status(200).json({
      success: true,
      data: { totalMembers: total, available, unavailable, away, availabilityPercentage, recentActivity },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTeamStats = async (req, res, next) => {
  try {
    const deptStats = await User.aggregate([
      { $group: { _id: '$department', total: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$availabilityStatus', 'available'] }, 1, 0] } }, unavailable: { $sum: { $cond: [{ $eq: ['$availabilityStatus', 'unavailable'] }, 1, 0] } }, away: { $sum: { $cond: [{ $eq: ['$availabilityStatus', 'away'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);
    const teams = await Team.find().populate('members', 'availabilityStatus isAvailable');
    const teamStats = teams.map((t) => {
      const total = t.members.length;
      const available = t.members.filter((m) => m.availabilityStatus === 'available').length;
      return { teamId: t._id, teamName: t.teamName, total, available, unavailable: total - available, percentage: total > 0 ? Math.round((available / total) * 100) : 0 };
    });
    res.status(200).json({ success: true, data: { departmentStats: deptStats, teamStats } });
  } catch (error) {
    next(error);
  }
};
