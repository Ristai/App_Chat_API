import express from 'express';
import MessageController from '../controllers/MessageController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get unread count (must be before /:roomId to avoid conflict)
router.get('/unread', MessageController.getUnreadCount.bind(MessageController));

// Message routes
router.post('/', MessageController.sendMessage.bind(MessageController));
router.get('/:roomId', MessageController.getMessages.bind(MessageController));
router.put('/:id/read', MessageController.markAsRead.bind(MessageController));

export default router;
