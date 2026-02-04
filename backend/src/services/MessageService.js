import { getFirestore } from '../config/firebase.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class MessageService {
  constructor() {
    this.db = null;
  }

  _getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  /**
   * Send a message
   * @param {Object} data - Message data
   * @returns {Promise<Object>} Created message
   */
  async sendMessage({ roomId, senderId, content, type = 'text', replyTo }) {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Message content is required');
    }

    const db = this._getDb();

    // Check if room exists
    const roomRef = db.collection('chats').doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    const room = roomDoc.data();

    // Check if user is in room
    if (!room.users.includes(senderId)) {
      throw new ValidationError('User not in room');
    }

    // Get sender info
    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderName = senderDoc.exists ? senderDoc.data().name : 'Unknown';

    // Create message
    const messageData = {
      senderId,
      senderName,
      content: content.trim(),
      type,
      createdAt: new Date(),
      isEdited: false,
    };

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    const messageRef = await roomRef.collection('messages').add(messageData);

    // Update room's last message
    await roomRef.update({
      lastMessage: content.trim(),
      lastUpdated: new Date(),
    });

    const messageDoc = await messageRef.get();
    return { id: messageDoc.id, ...messageDoc.data() };
  }

  /**
   * Get messages for a room
   * @param {string} roomId - Room ID
   * @param {number} limit - Max messages to return
   * @param {Date} before - Get messages before this date
   * @returns {Promise<Array>} List of messages
   */
  async getMessages(roomId, limit = 50, before = null) {
    const db = this._getDb();

    // Check if room exists
    const roomDoc = await db.collection('chats').doc(roomId).get();
    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    let query = db
      .collection('chats')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (before) {
      query = query.where('createdAt', '<', before);
    }

    const messagesSnapshot = await query.get();

    return messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Update message
   * @param {string} roomId - Room ID
   * @param {string} messageId - Message ID
   * @param {string} content - New content
   * @param {string} userId - User updating the message
   * @returns {Promise<Object>} Updated message
   */
  async updateMessage(roomId, messageId, content, userId) {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Message content is required');
    }

    const db = this._getDb();
    const messageRef = db
      .collection('chats')
      .doc(roomId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new NotFoundError('Message not found');
    }

    const message = messageDoc.data();

    // Check if user is the sender
    if (message.senderId !== userId) {
      throw new ValidationError('Not authorized to edit this message');
    }

    await messageRef.update({
      content: content.trim(),
      isEdited: true,
    });

    const updatedDoc = await messageRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  /**
   * Delete message
   * @param {string} roomId - Room ID
   * @param {string} messageId - Message ID
   * @param {string} userId - User deleting the message
   * @returns {Promise<void>}
   */
  async deleteMessage(roomId, messageId, userId) {
    const db = this._getDb();
    const messageRef = db
      .collection('chats')
      .doc(roomId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new NotFoundError('Message not found');
    }

    const message = messageDoc.data();

    // Check if user is the sender
    if (message.senderId !== userId) {
      throw new ValidationError('Not authorized to delete this message');
    }

    await messageRef.delete();
  }

  /**
   * Mark message as read
   * @param {string} roomId - Room ID
   * @param {string} messageId - Message ID
   * @param {string} userId - User marking as read
   * @returns {Promise<void>}
   */
  async markAsRead(roomId, messageId, userId) {
    const db = this._getDb();
    const messageRef = db
      .collection('chats')
      .doc(roomId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      throw new NotFoundError('Message not found');
    }

    // Add user to readBy array
    const message = messageDoc.data();
    const readBy = message.readBy || [];

    if (!readBy.includes(userId)) {
      await messageRef.update({
        readBy: [...readBy, userId],
      });
    }
  }

  /**
   * Get unread message count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    const db = this._getDb();

    // Get all rooms user is in
    const roomsSnapshot = await db
      .collection('chats')
      .where('users', 'array-contains', userId)
      .get();

    let unreadCount = 0;

    for (const roomDoc of roomsSnapshot.docs) {
      const messagesSnapshot = await roomDoc.ref
        .collection('messages')
        .where('senderId', '!=', userId)
        .get();

      for (const messageDoc of messagesSnapshot.docs) {
        const message = messageDoc.data();
        const readBy = message.readBy || [];
        
        if (!readBy.includes(userId)) {
          unreadCount++;
        }
      }
    }

    return unreadCount;
  }
}

export default new MessageService();
