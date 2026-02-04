import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.post('/refresh', AuthController.refreshToken.bind(AuthController));

// Protected routes
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));
router.get('/me', authMiddleware, AuthController.getCurrentUser.bind(AuthController));

export default router;
