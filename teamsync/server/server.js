const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const seedInitialData = require('./config/seed');
const { initializeSocket } = require('./sockets/socketHandler');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const availabilityRoutes = require('./routes/availability');
const teamRoutes = require('./routes/teams');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect DB and seed initial data if empty
connectDB().then(() => {
  seedInitialData();
});

// Initialize Socket.IO
initializeSocket(io);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests, please try again later.' } });
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'TeamSync API is running', timestamp: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`TeamSync server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
}

module.exports = { app, server };
