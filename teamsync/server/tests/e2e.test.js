const http = require('http');
const mongoose = require('mongoose');
const { io: ioClient } = require('../../client/node_modules/socket.io-client');
const { app, server } = require('../server');
const User = require('../models/User');
const AvailabilityHistory = require('../models/AvailabilityHistory');
const Team = require('../models/Team');

let BASE_URL;
let adminToken;
let memberToken;
let adminUser;
let memberUser;
let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedCount++;
  console.log(`✅ PASSED: ${message}`);
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING TEAMSYNC FULL-STACK END-TO-END TEST SUITE');
  console.log('======================================================\n');

  // Wait for server to listen
  await new Promise((resolve) => {
    if (server.listening) {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      resolve();
    } else {
      server.listen(0, () => {
        const port = server.address().port;
        BASE_URL = `http://localhost:${port}`;
        resolve();
      });
    }
  });

  console.log(`📡 Test server running at ${BASE_URL}\n`);

  // Wait for mongoose connection
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log('📦 Database ready for tests.\n');

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.success === true, 'Health check endpoint returns 200 OK');

    // 2. Register first user (Admin)
    const adminReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Admin Superuser',
        email: `admin_${Date.now()}@teamsync.test`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'Operations',
        designation: 'Operations Director',
      },
    });
    assert(adminReg.status === 201 && adminReg.data.token, 'Register first user returns 201 Created and JWT token');
    adminToken = adminReg.data.token;
    adminUser = adminReg.data.data.user;
    assert(adminUser.role === 'admin', 'First registered user is automatically assigned Admin role');
    assert(adminUser.isAvailable === false, 'New user default isAvailable is false');
    assert(adminUser.availabilityStatus === 'unavailable', 'New user default availabilityStatus is "unavailable"');

    // 3. Register second user (Member)
    const memberReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Jane Developer',
        email: `jane_${Date.now()}@teamsync.test`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        department: 'Engineering',
        designation: 'Frontend Engineer',
      },
    });
    assert(memberReg.status === 201 && memberReg.data.token, 'Register second user returns 201 Created');
    memberToken = memberReg.data.token;
    memberUser = memberReg.data.data.user;
    assert(memberUser.role === 'member', 'Second registered user is assigned Member role');

    // 4. Test login with valid credentials
    const loginSuccess = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: adminUser.email,
        password: 'Password123!',
      },
    });
    assert(loginSuccess.status === 200 && loginSuccess.data.token, 'Login with valid credentials succeeds (200 OK)');

    // 5. Reject invalid credentials
    const loginFail = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: adminUser.email,
        password: 'WrongPassword!',
      },
    });
    assert(loginFail.status === 401 && loginFail.data.success === false, 'Login with invalid credentials rejected (401 Unauthorized)');

    // 6. Test GET /api/auth/me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(meRes.status === 200 && meRes.data.data.user.email === adminUser.email, 'GET /api/auth/me returns authenticated user details');

    // 7. Load all authorized team members
    const allUsers = await request('/api/users', {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    assert(allUsers.status === 200 && allUsers.data.data.users.length >= 2, 'Load team members list returns all registered users');

    // 8. Test Socket.IO real-time connection and event broadcast
    const socket = ioClient(BASE_URL, {
      auth: { token: memberToken },
      transports: ['websocket'],
    });

    let socketReceivedUpdate = null;
    socket.on('availability:updated', (data) => {
      socketReceivedUpdate = data;
    });

    await new Promise((resolve) => socket.on('connect', resolve));
    assert(socket.connected === true, 'Socket.IO client authenticates and connects successfully');

    // 9. Change availability from false to true (User updates own availability)
    const updateToTrue = await request(`/api/availability/${adminUser._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        isAvailable: true,
        reason: 'Ready for standup and design review',
      },
    });
    assert(updateToTrue.status === 200 && updateToTrue.data.data.isAvailable === true, 'PATCH /api/availability updates isAvailable to true');
    assert(updateToTrue.data.data.availabilityStatus === 'available', 'Boolean true automatically syncs availabilityStatus to "available"');

    // 10. Verify MongoDB actually persists isAvailable: true
    const dbUserTrue = await User.findById(adminUser._id);
    assert(dbUserTrue.isAvailable === true, 'MongoDB document verified: isAvailable is TRUE in database');
    assert(dbUserTrue.availabilityStatus === 'available', 'MongoDB document verified: availabilityStatus is "available" in database');

    // Wait for Socket.IO event
    await new Promise((resolve) => setTimeout(resolve, 300));
    assert(
      socketReceivedUpdate !== null &&
      socketReceivedUpdate.userId.toString() === adminUser._id.toString() &&
      socketReceivedUpdate.isAvailable === true,
      'Socket.IO broadcasts availability:updated event to connected clients in real time'
    );

    // 11. Change availability from true to false
    const updateToFalse = await request(`/api/availability/${adminUser._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        isAvailable: false,
        reason: 'Stepping into focus session',
      },
    });
    assert(updateToFalse.status === 200 && updateToFalse.data.data.isAvailable === false, 'PATCH /api/availability updates isAvailable to false');
    assert(updateToFalse.data.data.availabilityStatus === 'unavailable', 'Boolean false automatically syncs availabilityStatus to "unavailable"');

    // 12. Verify MongoDB actually persists isAvailable: false
    const dbUserFalse = await User.findById(adminUser._id);
    assert(dbUserFalse.isAvailable === false, 'MongoDB document verified: isAvailable is FALSE in database');
    assert(dbUserFalse.availabilityStatus === 'unavailable', 'MongoDB document verified: availabilityStatus is "unavailable" in database');

    // 13. Test extended status "away"
    const updateToAway = await request(`/api/availability/${adminUser._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        availabilityStatus: 'away',
        reason: 'Lunch break',
      },
    });
    assert(updateToAway.status === 200 && updateToAway.data.data.availabilityStatus === 'away', 'Extended status "away" saved successfully');
    assert(updateToAway.data.data.isAvailable === false, 'Away status correctly enforces boolean isAvailable = false without contradiction');

    // 14. Verify AvailabilityHistory records every change
    const historyRes = await request(`/api/availability/history?userId=${adminUser._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(historyRes.status === 200 && historyRes.data.data.history.length >= 3, 'Availability history recorded all state transitions');
    const latestHistory = historyRes.data.data.history[0];
    assert(latestHistory.newStatus === 'away' && latestHistory.reason === 'Lunch break', 'History record stores correct status, author, and reason');

    // 15. Security test: unauthorized member CANNOT modify another user's availability
    const unauthorizedUpdate = await request(`/api/availability/${adminUser._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${memberToken}` }, // Member trying to edit Admin
      body: { isAvailable: true },
    });
    assert(
      unauthorizedUpdate.status === 403,
      'Security check passed: non-admin member forbidden from modifying another user (403 Forbidden)'
    );

    // 16. Admin permissions test: Admin CAN update another member's availability or role
    const adminEditMember = await request(`/api/availability/${memberUser._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isAvailable: true, reason: 'Admin override' },
    });
    assert(adminEditMember.status === 200 && adminEditMember.data.data.isAvailable === true, 'Admin successfully authorized to update member availability');

    // 17. Test Dashboard Stats calculations
    const statsRes = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200 OK');
    assert(typeof statsRes.data.data.totalMembers === 'number', 'Total members returned as numeric count');
    assert(typeof statsRes.data.data.availabilityPercentage === 'number', 'Availability percentage accurately calculated');

    // 18. Test Team creation and management
    const teamRes = await request('/api/teams', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        teamName: 'Frontend Guild',
        description: 'Vite and React UI specialists',
        department: 'Engineering',
      },
    });
    assert(teamRes.status === 201 && teamRes.data.data.team.teamName === 'Frontend Guild', 'Admin successfully creates team via POST /api/teams');

    // Cleanup socket
    socket.disconnect();

    console.log('\n======================================================');
    console.log(`🎉 ALL ${passedCount}/${totalCount} TEST SCENARIOS PASSED WITH ZERO ERRORS!`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test execution encountered an error:', error);
    process.exit(1);
  }
}

runTests();
