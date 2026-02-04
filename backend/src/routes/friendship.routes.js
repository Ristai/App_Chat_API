import express from 'express';
import FriendshipController from '../controllers/FriendshipController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get pending requests (must be before /:id routes)
router.get('/requests', FriendshipController.getPendingRequests.bind(FriendshipController));

// Get friends list
router.get('/', FriendshipController.getFriends.bind(FriendshipController));

// Send friend request
router.post('/request', FriendshipController.sendRequest.bind(FriendshipController));

// Accept friend request
router.post('/accept/:id', FriendshipController.acceptRequest.bind(FriendshipController));

// Reject friend request
router.post('/reject/:id', FriendshipController.rejectRequest.bind(FriendshipController));

// Remove friend
router.delete('/:id', FriendshipController.removeFriend.bind(FriendshipController));

export default router;
