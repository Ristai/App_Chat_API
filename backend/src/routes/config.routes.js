import express from 'express';
import ConfigController from '../controllers/ConfigController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes - no auth required for config
router.get('/firebase', ConfigController.getFirebaseConfig.bind(ConfigController));
router.get('/zego', ConfigController.getZegoConfig.bind(ConfigController));

// Protected routes
router.post('/zego/token', authMiddleware, ConfigController.generateZegoToken.bind(ConfigController));

export default router;
