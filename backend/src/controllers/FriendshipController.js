import FriendshipService from '../services/FriendshipService.js';

class FriendshipController {
  /**
   * Send friend request
   * POST /api/friendships/request
   */
  async sendRequest(req, res, next) {
    try {
      const fromUserId = req.user.userId;
      const { toUserId } = req.body;

      const friendship = await FriendshipService.sendRequest(fromUserId, toUserId);

      res.status(201).json({
        success: true,
        data: friendship,
        message: 'Friend request sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept friend request
   * POST /api/friendships/accept/:id
   */
  async acceptRequest(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const friendship = await FriendshipService.acceptRequest(id, userId);

      res.status(200).json({
        success: true,
        data: friendship,
        message: 'Friend request accepted',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject friend request
   * POST /api/friendships/reject/:id
   */
  async rejectRequest(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await FriendshipService.rejectRequest(id, userId);

      res.status(200).json({
        success: true,
        message: 'Friend request rejected',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove friend
   * DELETE /api/friendships/:id
   */
  async removeFriend(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await FriendshipService.removeFriend(id, userId);

      res.status(200).json({
        success: true,
        message: 'Friend removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get friends list
   * GET /api/friendships
   */
  async getFriends(req, res, next) {
    try {
      const userId = req.user.userId;
      const friends = await FriendshipService.getFriends(userId);

      res.status(200).json({
        success: true,
        data: friends,
        count: friends.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending requests
   * GET /api/friendships/requests
   */
  async getPendingRequests(req, res, next) {
    try {
      const userId = req.user.userId;
      const requests = await FriendshipService.getPendingRequests(userId);

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FriendshipController();
