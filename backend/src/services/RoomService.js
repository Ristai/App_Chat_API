import { getFirestore } from '../config/firebase.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class RoomService {
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
   * Create a new room
   * @param {Object} data - Room data
   * @returns {Promise<Object>} Created room
   */
  async createRoom({ name, isGroup, users, createdBy }) {
    const db = this._getDb();

    if (isGroup && (!name || name.trim().length === 0)) {
      throw new ValidationError('Group name is required');
    }

    if (!users || users.length === 0) {
      throw new ValidationError('At least one user is required');
    }

    // For direct chat, create consistent room ID
    let roomId;
    if (!isGroup && users.length === 2) {
      const sortedUsers = [...users].sort();
      roomId = sortedUsers.join('_');
      
      // Check if room already exists
      const existingRoom = await db.collection('chats').doc(roomId).get();
      if (existingRoom.exists) {
        return { id: existingRoom.id, ...existingRoom.data() };
      }
    }

    const roomData = {
      name: name || '',
      isGroup: isGroup || false,
      users,
      createdBy,
      createdAt: new Date(),
      lastMessage: '',
      lastUpdated: new Date(),
    };

    if (roomId) {
      await db.collection('chats').doc(roomId).set(roomData);
      return { id: roomId, ...roomData };
    } else {
      const roomRef = await db.collection('chats').add(roomData);
      const roomDoc = await roomRef.get();
      return { id: roomDoc.id, ...roomDoc.data() };
    }
  }

  /**
   * Get room by ID
   * @param {string} roomId - Room ID
   * @returns {Promise<Object>} Room data
   */
  async getRoomById(roomId) {
    const db = this._getDb();
    const roomDoc = await db.collection('chats').doc(roomId).get();

    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    return { id: roomDoc.id, ...roomDoc.data() };
  }

  /**
   * Get rooms for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of rooms
   */
  async getUserRooms(userId) {
    const db = this._getDb();
    const roomsSnapshot = await db
      .collection('chats')
      .where('users', 'array-contains', userId)
      .get();

    return roomsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Update room
   * @param {string} roomId - Room ID
   * @param {Object} updates - Room updates
   * @returns {Promise<Object>} Updated room
   */
  async updateRoom(roomId, updates) {
    const db = this._getDb();
    const roomRef = db.collection('chats').doc(roomId);
    
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    // Filter allowed fields
    const allowedFields = ['name', 'imageBase64'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    await roomRef.update(filteredUpdates);
    return this.getRoomById(roomId);
  }

  /**
   * Delete room
   * @param {string} roomId - Room ID
   * @returns {Promise<void>}
   */
  async deleteRoom(roomId) {
    const db = this._getDb();
    const roomRef = db.collection('chats').doc(roomId);
    
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    // Delete all messages in the room
    const messagesSnapshot = await roomRef.collection('messages').get();
    const batch = db.batch();
    
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the room
    batch.delete(roomRef);
    
    await batch.commit();
  }

  /**
   * Add member to room
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID to add
   * @returns {Promise<void>}
   */
  async addMember(roomId, userId) {
    const db = this._getDb();
    const roomRef = db.collection('chats').doc(roomId);
    
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    const room = roomDoc.data();
    
    if (!room.isGroup) {
      throw new ValidationError('Cannot add members to direct chat');
    }

    if (room.users.includes(userId)) {
      throw new ValidationError('User already in room');
    }

    await roomRef.update({
      users: [...room.users, userId],
    });
  }

  /**
   * Remove member from room
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<void>}
   */
  async removeMember(roomId, userId) {
    const db = this._getDb();
    const roomRef = db.collection('chats').doc(roomId);
    
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      throw new NotFoundError('Room not found');
    }

    const room = roomDoc.data();
    
    if (!room.isGroup) {
      throw new ValidationError('Cannot remove members from direct chat');
    }

    if (!room.users.includes(userId)) {
      throw new ValidationError('User not in room');
    }

    await roomRef.update({
      users: room.users.filter(id => id !== userId),
    });
  }
}

export default new RoomService();
