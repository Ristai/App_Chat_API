import { getFirestore } from '../config/firebase.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class UserService {
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
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserById(userId) {
    const db = this._getDb();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new NotFoundError('User not found');
    }

    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, updates) {
    const db = this._getDb();
    const userRef = db.collection('users').doc(userId);
    
    // Check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new NotFoundError('User not found');
    }

    // Filter allowed fields
    const allowedFields = ['name', 'photoUrl', 'fcmToken'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Update user
    await userRef.update(filteredUpdates);

    // Get updated user
    return this.getUserById(userId);
  }

  /**
   * Upload profile photo
   * @param {string} userId - User ID
   * @param {string} photoUrl - Photo URL
   * @returns {Promise<void>}
   */
  async uploadPhoto(userId, photoUrl) {
    const db = this._getDb();
    const userRef = db.collection('users').doc(userId);
    
    // Check if user exists
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new NotFoundError('User not found');
    }

    await userRef.update({ photoUrl });
  }

  /**
   * Search users by name or email
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} List of users
   */
  async searchUsers(query, limit = 50) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const db = this._getDb();
    const usersRef = db.collection('users');
    
    // Search by name (case-insensitive prefix match)
    const nameQuery = await usersRef
      .where('name', '>=', query)
      .where('name', '<=', query + '\uf8ff')
      .limit(limit)
      .get();

    const users = nameQuery.docs.map(doc => {
      const user = { id: doc.id, ...doc.data() };
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return users;
  }

  /**
   * Update user online status
   * @param {string} userId - User ID
   * @param {boolean} isOnline - Online status
   * @returns {Promise<void>}
   */
  async updateOnlineStatus(userId, isOnline) {
    const db = this._getDb();
    await db.collection('users').doc(userId).update({
      isOnline,
      lastSeen: new Date(),
    });
  }
}

export default new UserService();
