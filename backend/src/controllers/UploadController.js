import LocalUploadService from "../services/LocalUploadService.js";

class UploadController {
  /**
   * Upload multiple images
   * POST /api/upload/images
   */
  async uploadImages(req, res, next) {
    try {
      console.log("📥 [UPLOAD CONTROLLER] Request received");
      console.log("📥 [UPLOAD CONTROLLER] Body:", req.body);
      console.log("📥 [UPLOAD CONTROLLER] Files:", req.files);

      const files = req.files;
      const { roomId } = req.body;

      if (!files || files.length === 0) {
        console.log("❌ [UPLOAD CONTROLLER] No files");
        return res.status(400).json({
          success: false,
          error: "No images provided",
        });
      }

      if (!roomId) {
        console.log(
          "❌ [UPLOAD CONTROLLER] No roomId. Body:",
          JSON.stringify(req.body),
        );
        return res.status(400).json({
          success: false,
          error: "Room ID is required",
        });
      }

      console.log("✓ [UPLOAD CONTROLLER] Validation passed, uploading...");

      const urls = await LocalUploadService.uploadImages(files, roomId);

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

      await LocalUploadService.deleteImages(urls);

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
