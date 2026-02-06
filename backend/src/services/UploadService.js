import { getStorage } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

class UploadService {
  /**
   * Upload multiple images to Firebase Storage
   * @param {Array} files - Array of file objects from multer
   * @param {string} roomId - Room ID for organizing images
   * @returns {Promise<Array>} Array of public URLs
   */
  async uploadImages(files, roomId) {
    console.log("📤 [UPLOAD SERVICE] Starting upload");
    console.log("📤 [UPLOAD SERVICE] Files:", files.length);
    console.log("📤 [UPLOAD SERVICE] Room ID:", roomId);

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    try {
      const storage = getStorage();
      console.log("✓ [UPLOAD SERVICE] Storage initialized");

      const bucket = storage.bucket();
      console.log("✓ [UPLOAD SERVICE] Bucket:", bucket.name);
      console.log("✓ [UPLOAD SERVICE] Bucket ID:", bucket.id);

      const uploadPromises = files.map((file) =>
        this.uploadSingleImage(bucket, file, roomId),
      );

      const urls = await Promise.all(uploadPromises);
      console.log("✅ [UPLOAD SERVICE] Upload successful! URLs:", urls);
      return urls;
    } catch (error) {
      console.error("❌ [UPLOAD SERVICE] Error:", error.message);
      console.error("❌ [UPLOAD SERVICE] Error name:", error.name);
      console.error("❌ [UPLOAD SERVICE] Error code:", error.code);
      console.error(
        "❌ [UPLOAD SERVICE] Full error:",
        JSON.stringify(error, null, 2),
      );
      console.error("❌ [UPLOAD SERVICE] Stack:", error.stack);
      throw error;
    }
  }

  /**
   * Upload a single image to Firebase Storage
   * @param {Bucket} bucket - Firebase Storage bucket
   * @param {Object} file - File object from multer
   * @param {string} roomId - Room ID for organizing images
   * @returns {Promise<string>} Public URL of uploaded image
   */
  async uploadSingleImage(bucket, file, roomId) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const ext = path.extname(file.originalname) || ".jpg";
    const fileName = `chat-images/${roomId}/${timestamp}_${uniqueId}${ext}`;

    console.log(`📁 [UPLOAD SINGLE] File name: ${fileName}`);
    console.log(`📁 [UPLOAD SINGLE] MIME type: ${file.mimetype}`);
    console.log(`📁 [UPLOAD SINGLE] Buffer size: ${file.buffer.length}`);

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uniqueId,
        },
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        console.error(`❌ [UPLOAD SINGLE] Stream error:`, error);
        console.error(`❌ [UPLOAD SINGLE] Error message:`, error.message);
        console.error(`❌ [UPLOAD SINGLE] Error code:`, error.code);
        reject(new Error(`Upload failed: ${error.message}`));
      });

      blobStream.on("finish", async () => {
        try {
          console.log(`✓ [UPLOAD SINGLE] Stream finished, making public...`);
          // Make the file publicly accessible
          await blob.makePublic();
          console.log(`✓ [UPLOAD SINGLE] File made public`);

          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          console.log(`✅ [UPLOAD SINGLE] Public URL: ${publicUrl}`);
          resolve(publicUrl);
        } catch (error) {
          console.error(`❌ [UPLOAD SINGLE] Error making public:`, error);
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  }

  /**
   * Delete an image from Firebase Storage
   * @param {string} imageUrl - Public URL of the image to delete
   */
  async deleteImage(imageUrl) {
    try {
      const storage = getStorage();
      const bucket = storage.bucket();

      // Extract file path from URL
      const urlParts = imageUrl.split(`${bucket.name}/`);
      if (urlParts.length < 2) {
        throw new Error("Invalid image URL");
      }

      const filePath = urlParts[1];
      await bucket.file(filePath).delete();

      return true;
    } catch (error) {
      console.error("Error deleting image:", error.message);
      throw error;
    }
  }

  /**
   * Delete multiple images from Firebase Storage
   * @param {Array<string>} imageUrls - Array of public URLs to delete
   */
  async deleteImages(imageUrls) {
    const deletePromises = imageUrls.map((url) => this.deleteImage(url));
    await Promise.all(deletePromises);
    return true;
  }
}

export default new UploadService();
