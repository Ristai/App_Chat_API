import express from "express";
import UploadController from "../controllers/UploadController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  uploadImages,
  handleUploadError,
} from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload images - POST /api/upload/images
router.post(
  "/images",
  uploadImages,
  handleUploadError,
  UploadController.uploadImages.bind(UploadController),
);

// Delete images - DELETE /api/upload/images
router.delete("/images", UploadController.deleteImages.bind(UploadController));

export default router;
