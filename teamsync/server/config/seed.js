const User = require('../models/User');
const Team = require('../models/Team');
const AvailabilityHistory = require('../models/AvailabilityHistory');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Already has users
    }

    console.log('🌱 Database is empty. Seeding initial demo users and teams...');

    // 1. Create Admin User
    const admin = await User.create({
      fullName: 'Sarah Chen',
      email: 'admin@teamsync.dev',
      password: 'Password123!',
      role: 'admin',
      designation: 'VP of Engineering',
      department: 'Engineering',
      isAvailable: true,
      availabilityStatus: 'available',
      statusMessage: 'Leading Q4 Architecture Review 🚀',
      workingHours: { start: '08:30', end: '17:30' },
      timezone: 'America/New_York',
    });

    // 2. Create Member Users
    const member1 = await User.create({
      fullName: 'Alex Rivera',
      email: 'member@teamsync.dev',
      password: 'Password123!',
      role: 'member',
      designation: 'Senior Frontend Engineer',
      department: 'Engineering',
      isAvailable: false,
      availabilityStatus: 'unavailable',
      statusMessage: 'Deep work on Socket.IO sync optimizations',
      workingHours: { start: '09:00', end: '18:00' },
      timezone: 'America/New_York',
    });

    const member2 = await User.create({
      fullName: 'Elena Rostova',
      email: 'elena@teamsync.dev',
      password: 'Password123!',
      role: 'member',
      designation: 'Lead UI/UX Designer',
      department: 'Design',
      isAvailable: false,
      availabilityStatus: 'away',
      statusMessage: 'Coffee break & user interviews ☕',
      workingHours: { start: '10:00', end: '18:30' },
      timezone: 'Europe/London',
    });

    const member3 = await User.create({
      fullName: 'Marcus Vance',
      email: 'marcus@teamsync.dev',
      password: 'Password123!',
      role: 'member',
      designation: 'Product Manager',
      department: 'Product',
      isAvailable: true,
      availabilityStatus: 'available',
      statusMessage: 'Available for syncs and roadmap reviews',
      workingHours: { start: '09:00', end: '17:00' },
      timezone: 'America/Los_Angeles',
    });

    // 3. Create Default Team
    const team = await Team.create({
      teamName: 'Core Platform Engineering',
      description: 'Responsible for real-time infrastructure, cloud databases, and frontend architecture.',
      department: 'Engineering',
      inviteCode: 'CORE2026',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id, member3._id],
    });

    // Update users with teamId
    await User.updateMany(
      { _id: { $in: [admin._id, member1._id, member2._id, member3._id] } },
      { teamId: team._id }
    );

    // 4. Seed initial availability history
    await AvailabilityHistory.create([
      {
        userId: admin._id,
        previousStatus: 'unavailable',
        newStatus: 'available',
        previousAvailability: false,
        newAvailability: true,
        updatedBy: admin._id,
        reason: 'Online for morning standup',
        changedAt: new Date(Date.now() - 3600000),
      },
      {
        userId: member2._id,
        previousStatus: 'available',
        newStatus: 'away',
        previousAvailability: true,
        newAvailability: false,
        updatedBy: member2._id,
        reason: 'Coffee break',
        changedAt: new Date(Date.now() - 1800000),
      },
    ]);

    console.log('✅ Demo data seeded successfully:');
    console.log('   👤 Admin:  admin@teamsync.dev / Password123!');
    console.log('   👤 Member: member@teamsync.dev / Password123!');
  } catch (error) {
    console.warn('Seed warning:', error.message);
  }
};

module.exports = seedInitialData;
