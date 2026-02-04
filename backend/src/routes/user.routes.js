import express from 'express';
import UserController from '../controllers/UserController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search users (must be before /:id to avoid conflict)
router.get('/search', UserController.searchUsers.bind(UserController));

// User profile routes
router.get('/:id', UserController.getUserById.bind(UserController));
router.put('/:id', UserController.updateProfile.bind(UserController));
router.post('/:id/photo', uploadSingle, UserController.uploadPhoto.bind(UserController));

export default router;
