import MessageService from '../services/MessageService.js';
import { getIO } from '../config/socket.js';

export function setupMessageHandlers(socket) {
  // Join a room
  socket.on('join_room', async (roomId) => {
    try {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        roomId,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a room
  socket.on('leave_room', async (roomId) => {
    try {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
      
      // Notify others in the room
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        roomId,
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { roomId, content, type, mediaUrl } = data;

      // Create message
      const message = await MessageService.sendMessage({
        roomId,
        senderId: socket.userId,
        content,
        type: type || 'text',
        mediaUrl: mediaUrl || null,
      });

      // Broadcast to all users in the room (including sender)
      const io = getIO();
      io.to(roomId).emit('new_message', message);

      console.log(`Message sent in room ${roomId} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message: ' + error.message });
    }
  });

  // User typing
  socket.on('typing', async (data) => {
    try {
      const { roomId, userName } = data;
      
      // Broadcast to others in the room (not sender)
      socket.to(roomId).emit('user_typing', {
        roomId,
        userId: socket.userId,
        userName: userName || 'User',
      });
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });

  // User stopped typing
  socket.on('stop_typing', async (data) => {
    try {
      const { roomId } = data;
      
      // Broadcast to others in the room (not sender)
      socket.to(roomId).emit('user_stop_typing', {
        roomId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Error handling stop typing:', error);
    }
  });

  // Mark message as read
  socket.on('mark_read', async (messageId) => {
    try {
      const message = await MessageService.markAsRead(messageId, socket.userId);
      
      // Broadcast to all users in the room
      const io = getIO();
      io.to(message.roomId.toString()).emit('message_read', {
        messageId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  });
}
