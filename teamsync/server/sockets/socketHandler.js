const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const connectedUsers = new Map(); // userId -> socketId

const initializeSocket = (socketIO) => {
  io = socketIO;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);

    // Join team room if user has a team
    if (socket.user.teamId) {
      socket.join(`team-${socket.user.teamId.toString()}`);
    }
    // Always join personal room
    socket.join(`user-${userId}`);

    // Update lastActiveAt
    User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).exec();

    // Broadcast online status to team
    if (socket.user.teamId) {
      socket.to(`team-${socket.user.teamId.toString()}`).emit('user:online', {
        userId,
        fullName: socket.user.fullName,
      });
    }

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      if (socket.user.teamId) {
        socket.to(`team-${socket.user.teamId.toString()}`).emit('user:offline', {
          userId,
        });
      }
    });
  });
};

const emitAvailabilityUpdate = (teamId, data) => {
  if (!io) return;
  // Broadcast to all connected clients for real-time dashboard sync
  io.emit('availability:updated', data);
  if (teamId) {
    io.to(`team-${teamId.toString()}`).emit('availability:team_updated', data);
  }
};

const getIO = () => io;
const getConnectedUsers = () => connectedUsers;

module.exports = { initializeSocket, emitAvailabilityUpdate, getIO, getConnectedUsers };
