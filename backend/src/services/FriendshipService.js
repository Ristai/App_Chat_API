import { getFirestore } from '../config/firebase.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';

class FriendshipService {
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
   * Send friend request
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Receiver user ID
   * @returns {Promise<Object>} Friend request
   */
  async sendFriendRequest(fromUserId, toUserId) {
    if (fromUserId === toUserId) {
      throw new ValidationError('Cannot send friend request to yourself');
    }

    const db = this._getDb();

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      db.collection('users').doc(fromUserId).get(),
      db.collection('users').doc(toUserId).get(),
    ]);

    if (!fromUser.exists || !toUser.exists) {
      throw new NotFoundError('User not found');
    }

    // Check if already friends
    const friendDoc = await db
      .collection('users')
      .doc(fromUserId)
      .collection('friends')
      .doc(toUserId)
      .get();

    if (friendDoc.exists) {
      throw new ConflictError('Already friends');
    }

    // Check if request already exists
    const existingRequest = await db
      .collection('friend_requests')
      .where('fromUserId', '==', fromUserId)
      .where('toUserId', '==', toUserId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequest.empty) {
      throw new ConflictError('Friend request already sent');
    }

    // Create friend request
    const requestRef = await db.collection('friend_requests').add({
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date(),
    });

    const requestDoc = await requestRef.get();
    return { id: requestDoc.id, ...requestDoc.data() };
  }

  /**
   * Accept friend request
   * @param {string} requestId - Request ID
   * @param {string} userId - User accepting the request
   * @returns {Promise<void>}
   */
  async acceptFriendRequest(requestId, userId) {
    const db = this._getDb();
    const requestRef = db.collection('friend_requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new NotFoundError('Friend request not found');
    }

    const request = requestDoc.data();

    if (request.toUserId !== userId) {
      throw new ValidationError('Not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new ValidationError('Request already processed');
    }

    // Update request status
    await requestRef.update({ status: 'accepted' });

    // Add to friends collection for both users
    const batch = db.batch();

    batch.set(
      db.collection('users').doc(userId).collection('friends').doc(request.fromUserId),
      {
        friendId: request.fromUserId,
        createdAt: new Date(),
      }
    );

    batch.set(
      db.collection('users').doc(request.fromUserId).collection('friends').doc(userId),
      {
        friendId: userId,
        createdAt: new Date(),
      }
    );

    await batch.commit();
  }

  /**
   * Reject friend request
   * @param {string} requestId - Request ID
   * @param {string} userId - User rejecting the request
   * @returns {Promise<void>}
   */
  async rejectFriendRequest(requestId, userId) {
    const db = this._getDb();
    const requestRef = db.collection('friend_requests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new NotFoundError('Friend request not found');
    }

    const request = requestDoc.data();

    if (request.toUserId !== userId) {
      throw new ValidationError('Not authorized to reject this request');
    }

    if (request.status !== 'pending') {
      throw new ValidationError('Request already processed');
    }

    await requestRef.update({ status: 'rejected' });
  }

  /**
   * Get friend requests for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of friend requests
   */
  async getFriendRequests(userId) {
    const db = this._getDb();
    const requestsSnapshot = await db
      .collection('friend_requests')
      .where('toUserId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    const requests = [];
    for (const doc of requestsSnapshot.docs) {
      const request = { id: doc.id, ...doc.data() };
      
      // Get sender info
      const senderDoc = await db.collection('users').doc(request.fromUserId).get();
      if (senderDoc.exists) {
        const sender = senderDoc.data();
        request.fromUser = {
          uid: sender.uid,
          name: sender.name,
          email: sender.email,
          photoUrl: sender.photoUrl,
        };
      }
      
      requests.push(request);
    }

    return requests;
  }

  /**
   * Get friends list
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of friends
   */
  async getFriends(userId) {
    const db = this._getDb();
    const friendsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('friends')
      .get();

    const friends = [];
    for (const doc of friendsSnapshot.docs) {
      const friendId = doc.id;
      const friendDoc = await db.collection('users').doc(friendId).get();
      
      if (friendDoc.exists) {
        const friend = friendDoc.data();
        friends.push({
          uid: friend.uid,
          name: friend.name,
          email: friend.email,
          photoUrl: friend.photoUrl,
          isOnline: friend.isOnline,
          lastSeen: friend.lastSeen,
        });
      }
    }

    return friends;
  }

  /**
   * Remove friend
   * @param {string} userId - User ID
   * @param {string} friendId - Friend ID to remove
   * @returns {Promise<void>}
   */
  async removeFriend(userId, friendId) {
    const db = this._getDb();

    // Check if they are friends
    const friendDoc = await db
      .collection('users')
      .doc(userId)
      .collection('friends')
      .doc(friendId)
      .get();

    if (!friendDoc.exists) {
      throw new NotFoundError('Not friends with this user');
    }

    // Remove from both users' friends collections
    const batch = db.batch();

    batch.delete(
      db.collection('users').doc(userId).collection('friends').doc(friendId)
    );

    batch.delete(
      db.collection('users').doc(friendId).collection('friends').doc(userId)
    );

    await batch.commit();
  }
}

export default new FriendshipService();
