import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LocalUploadService {
  constructor() {
    // Create uploads directory relative to project root
    this.uploadsDir = path.join(__dirname, "../../uploads/chat-images");
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log("✓ [LOCAL UPLOAD] Upload directory ready:", this.uploadsDir);
    } catch (error) {
      console.error("❌ [LOCAL UPLOAD] Error creating directory:", error);
    }
  }

  /**
   * Upload multiple images to local storage
   * @param {Array} files - Array of file objects from multer
   * @param {string} roomId - Room ID for organizing images
   * @returns {Promise<Array>} Array of public URLs
   */
  async uploadImages(files, roomId) {
    console.log("📤 [LOCAL UPLOAD] Starting upload");
    console.log("📤 [LOCAL UPLOAD] Files:", files.length);
    console.log("📤 [LOCAL UPLOAD] Room ID:", roomId);

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    try {
      // Ensure room directory exists
      const roomDir = path.join(this.uploadsDir, roomId);
      await fs.mkdir(roomDir, { recursive: true });

      const uploadPromises = files.map((file) =>
        this.uploadSingleImage(file, roomId),
      );

      const urls = await Promise.all(uploadPromises);
      console.log("✅ [LOCAL UPLOAD] Upload successful! URLs:", urls);
      return urls;
    } catch (error) {
      console.error("❌ [LOCAL UPLOAD] Error:", error.message);
      console.error("❌ [LOCAL UPLOAD] Stack:", error.stack);
      throw error;
    }
  }

  /**
   * Upload a single image to local storage
   * @param {Object} file - File object from multer
   * @param {string} roomId - Room ID for organizing images
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadSingleImage(file, roomId) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const ext = path.extname(file.originalname) || ".jpg";
    const fileName = `${timestamp}_${uniqueId}${ext}`;
    const filePath = path.join(this.uploadsDir, roomId, fileName);

    console.log(`📁 [LOCAL UPLOAD] Saving to: ${filePath}`);
    console.log(`📁 [LOCAL UPLOAD] MIME type: ${file.mimetype}`);
    console.log(`📁 [LOCAL UPLOAD] Buffer size: ${file.buffer.length}`);

    try {
      // Write file to disk
      await fs.writeFile(filePath, file.buffer);
      console.log(`✓ [LOCAL UPLOAD] File saved successfully`);

      // Generate public URL with full host and port
      const host = process.env.API_HOST || "localhost";
      const port = process.env.API_PORT || "3000";

      // Use 192.168.2.4 if API_HOST is 0.0.0.0 (for mobile access)
      const baseHost = host === "0.0.0.0" ? "192.168.2.4" : host;

      const publicUrl = `http://${baseHost}:${port}/uploads/chat-images/${roomId}/${fileName}`;
      console.log(`✅ [LOCAL UPLOAD] Public URL: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error(`❌ [LOCAL UPLOAD] Error saving file:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Delete an image from local storage
   * @param {string} imageUrl - URL of the image to delete
   */
  async deleteImage(imageUrl) {
    try {
      // Extract file path from URL (remove /uploads/ prefix)
      const relativePath = imageUrl.replace("/uploads/", "");
      const filePath = path.join(__dirname, "../../uploads", relativePath);

      await fs.unlink(filePath);
      console.log(`✓ [LOCAL UPLOAD] Deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error("❌ [LOCAL UPLOAD] Error deleting image:", error.message);
      throw error;
    }
  }

  /**
   * Delete multiple images from local storage
   * @param {Array<string>} imageUrls - Array of URLs to delete
   */
  async deleteImages(imageUrls) {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.all(deletePromises);
    return true;
  }
}

export default new LocalUploadService();
