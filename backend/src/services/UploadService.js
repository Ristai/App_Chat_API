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
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    const storage = getStorage();
    const bucket = storage.bucket();
    const uploadPromises = files.map((file) =>
      this.uploadSingleImage(bucket, file, roomId),
    );

    const urls = await Promise.all(uploadPromises);
    return urls;
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
        reject(new Error(`Upload failed: ${error.message}`));
      });

      blobStream.on("finish", async () => {
        // Make the file publicly accessible
        await blob.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
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
