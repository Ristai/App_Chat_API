import UploadService from "../services/UploadService.js";

class UploadController {
  /**
   * Upload multiple images
   * POST /api/upload/images
   */
  async uploadImages(req, res, next) {
    try {
      const files = req.files;
      const { roomId } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No images provided",
        });
      }

      if (!roomId) {
        return res.status(400).json({
          success: false,
          error: "Room ID is required",
        });
      }

      const urls = await UploadService.uploadImages(files, roomId);

      res.status(200).json({
        success: true,
        data: {
          urls,
          count: urls.length,
        },
        message: `Successfully uploaded ${urls.length} image(s)`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete images
   * DELETE /api/upload/images
   */
  async deleteImages(req, res, next) {
    try {
      const { urls } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Image URLs are required",
        });
      }

      await UploadService.deleteImages(urls);

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${urls.length} image(s)`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
