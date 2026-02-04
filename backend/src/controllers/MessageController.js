import MessageService from '../services/MessageService.js';

class MessageController {
  /**
   * Send message
   * POST /api/messages
   */
  async sendMessage(req, res, next) {
    try {
      const senderId = req.user.userId;
      const { roomId, content, type, mediaUrl } = req.body;

      const message = await MessageService.sendMessage({
        roomId,
        senderId,
        content,
        type,
        mediaUrl,
      });

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages for a room
   * GET /api/messages/:roomId
   */
  async getMessages(req, res, next) {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;
      const { limit, skip, before } = req.query;

      const messages = await MessageService.getMessages(roomId, userId, {
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0,
        before,
      });

      res.status(200).json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark message as read
   * PUT /api/messages/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const message = await MessageService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        data: message,
        message: 'Message marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread message count
   * GET /api/messages/unread
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId;
      const countByRoom = await MessageService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: countByRoom,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
