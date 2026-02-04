import UserService from '../services/UserService.js';

class UserController {
  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/:id
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Check if user is updating their own profile
      if (id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own profile',
          },
        });
      }

      const user = await UserService.updateProfile(id, req.body);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload profile photo
   * POST /api/users/:id/photo
   */
  async uploadPhoto(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Check if user is updating their own profile
      if (id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own profile',
          },
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
      }

      // Generate photo URL
      const photoUrl = `/uploads/${req.file.filename}`;
      await UserService.uploadPhoto(id, photoUrl);
      
      res.status(200).json({
        success: true,
        data: { photoUrl },
        message: 'Photo uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search users
   * GET /api/users/search?q=query
   */
  async searchUsers(req, res, next) {
    try {
      const { q, limit } = req.query;
      const users = await UserService.searchUsers(q, parseInt(limit) || 50);
      
      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
