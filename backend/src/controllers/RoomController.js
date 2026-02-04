import RoomService from '../services/RoomService.js';

class RoomController {
  /**
   * Create room
   * POST /api/rooms
   */
  async createRoom(req, res, next) {
    try {
      const userId = req.user.userId;
      const { name, type, memberIds } = req.body;

      const room = await RoomService.createRoom({
        name,
        type,
        memberIds,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's rooms
   * GET /api/rooms
   */
  async getRooms(req, res, next) {
    try {
      const userId = req.user.userId;
      const rooms = await RoomService.getRooms(userId);

      res.status(200).json({
        success: true,
        data: rooms,
        count: rooms.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get room by ID
   * GET /api/rooms/:id
   */
  async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const room = await RoomService.getRoomById(id, userId);

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update room
   * PUT /api/rooms/:id
   */
  async updateRoom(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const room = await RoomService.updateRoom(id, userId, req.body);

      res.status(200).json({
        success: true,
        data: room,
        message: 'Room updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add members to room
   * POST /api/rooms/:id/members
   */
  async addMembers(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { memberIds } = req.body;

      const room = await RoomService.addMembers(id, userId, memberIds);

      res.status(200).json({
        success: true,
        data: room,
        message: 'Members added successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove member from room
   * DELETE /api/rooms/:id/members/:userId
   */
  async removeMember(req, res, next) {
    try {
      const { id, userId: memberIdToRemove } = req.params;
      const userId = req.user.userId;

      await RoomService.removeMember(id, userId, memberIdToRemove);

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RoomController();
