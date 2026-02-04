import express from 'express';
import RoomController from '../controllers/RoomController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Room routes
router.post('/', RoomController.createRoom.bind(RoomController));
router.get('/', RoomController.getRooms.bind(RoomController));
router.get('/:id', RoomController.getRoomById.bind(RoomController));
router.put('/:id', RoomController.updateRoom.bind(RoomController));
router.post('/:id/members', RoomController.addMembers.bind(RoomController));
router.delete('/:id/members/:userId', RoomController.removeMember.bind(RoomController));

export default router;
