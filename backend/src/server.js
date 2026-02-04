import app from './app.js';
import { initializeFirebase } from './config/firebase.js';
import { initializeSocket } from './config/socket.js';
import { socketAuthMiddleware } from './middleware/socket.auth.middleware.js';
import { setupMessageHandlers } from './socket/messageHandler.js';
import { setupStatusHandlers } from './socket/statusHandler.js';
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Firebase before starting server
try {
  initializeFirebase();
  console.log('✅ Firebase initialized successfully');

  // Initialize Socket.IO
  const io = initializeSocket(httpServer);

  // Socket.IO authentication middleware
  io.use(socketAuthMiddleware);

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Setup handlers
    setupMessageHandlers(socket);
    setupStatusHandlers(socket);

    // Set user online on connection
    socket.emit('connected', { userId: socket.userId });
  });

  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO ready`);
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    io.close(() => {
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

export default app;
