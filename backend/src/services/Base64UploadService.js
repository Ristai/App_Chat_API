class Base64UploadService {
  /**
   * Upload multiple images and convert to base64
   * @param {Array} files - Array of file objects from multer
   * @param {string} roomId - Room ID for organizing images
   * @returns {Promise<Array>} Array of base64 image objects
   */
  async uploadImages(files, roomId) {
    console.log("📤 [BASE64 UPLOAD SERVICE] Starting conversion");
    console.log("📤 [BASE64 UPLOAD SERVICE] Files:", files.length);
    console.log("📤 [BASE64 UPLOAD SERVICE] Room ID:", roomId);

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    // Validate file sizes (max 500KB to stay under 1MB Firestore limit)
    for (const file of files) {
      const sizeInKB = file.size / 1024;
      console.log(
        `📊 [BASE64 UPLOAD SERVICE] File: ${file.originalname}, Size: ${sizeInKB.toFixed(2)}KB`,
      );

      if (file.size > 500000) {
        throw new Error(
          `Image "${file.originalname}" is too large (${sizeInKB.toFixed(2)}KB). Maximum allowed: 500KB`,
        );
      }
    }

    try {
      const base64Images = files.map((file) => {
        const base64Data = file.buffer.toString("base64");

        return {
          data: base64Data,
          mimeType: file.mimetype,
          fileName: file.originalname,
          size: file.size,
        };
      });

      console.log("✅ [BASE64 UPLOAD SERVICE] Conversion successful!");
      console.log(
        `✅ [BASE64 UPLOAD SERVICE] Converted ${base64Images.length} image(s)`,
      );

      return base64Images;
    } catch (error) {
      console.error("❌ [BASE64 UPLOAD SERVICE] Error:", error.message);
      throw error;
    }
  }

  /**
   * Delete images - Not applicable for base64 storage
   * Base64 images are deleted when the Firestore document is deleted
   */
  async deleteImages(imageData) {
    console.log(
      "ℹ️ [BASE64 UPLOAD SERVICE] Delete not needed for base64 storage",
    );
    return true;
  }
}

export default new Base64UploadService();
