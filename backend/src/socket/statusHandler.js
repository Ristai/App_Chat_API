import UserService from '../services/UserService.js';
import { getIO } from '../config/socket.js';

export function setupStatusHandlers(socket) {
  // User connected - set online
  socket.on('user_online', async () => {
    try {
      await UserService.updateOnlineStatus(socket.userId, true);
      
      // Broadcast to all connected clients
      const io = getIO();
      io.emit('user_online', { userId: socket.userId });
      
      console.log(`User ${socket.userId} is online`);
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    try {
      await UserService.updateOnlineStatus(socket.userId, false);
      
      // Broadcast to all connected clients
      const io = getIO();
      io.emit('user_offline', { userId: socket.userId });
      
      console.log(`User ${socket.userId} disconnected`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
}
