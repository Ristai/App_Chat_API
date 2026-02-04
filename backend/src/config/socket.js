import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.util.js';

let io = null;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  console.log('✅ Socket.IO initialized');

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export default { initializeSocket, getIO };
