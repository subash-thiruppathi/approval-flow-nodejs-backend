const app = require('./app');
const db = require('./models');
const { createRoles } = require('./seeders/roles.seeder');
const { createStatuses } = require('./seeders/status.seeder');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userEmail} connected via Socket.IO`);
  
  // Join user to their personal room for targeted notifications
  socket.join(`user_${socket.userId}`);
  
  // Handle notification acknowledgment
  socket.on('notification_received', (data) => {
    console.log(`User ${socket.userId} received notification:`, data.notificationId);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userEmail} disconnected from Socket.IO`);
  });
});

// Make io available globally for notification service
global.io = io;

(async () => {
  try {
    // Sync database (uncomment to recreate tables)
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized successfully');
    
    // Seed roles and statuses
    await createRoles();
    await createStatuses();
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('\n=== Multi-Level Expense Approval System with Real-time Notifications ===');
      console.log('Approval Flow: Employee → Manager → Accountant → Admin');
      console.log('API Documentation: http://localhost:' + PORT + '/api-docs');
      console.log('Socket.IO enabled for real-time notifications');
      console.log('Firebase Push Notifications configured');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
