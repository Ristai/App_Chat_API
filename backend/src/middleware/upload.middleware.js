import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ValidationError } from "../utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10;

// Configure disk storage for local uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Configure memory storage for Firebase uploads
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log(
    "📁 [MULTER] File filter - Name:",
    file.originalname,
    "MIME:",
    file.mimetype,
  );

  if (ALLOWED_TYPES.includes(file.mimetype)) {
    console.log("✓ [MULTER] File accepted");
    cb(null, true);
  } else {
    console.log(
      "❌ [MULTER] File rejected - not in allowed types:",
      ALLOWED_TYPES,
    );
    cb(
      new ValidationError(
        "Only image files are allowed (jpeg, jpg, png, gif, webp)",
      ),
    );
  }
};

// Configure multer for disk storage
const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || MAX_FILE_SIZE,
  },
});

// Configure multer for memory storage (Firebase)
const uploadToMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

// Existing exports for disk storage
export const uploadSingle = upload.single("photo");
export const uploadMultiple = upload.array("photos", 10);

// New exports for Firebase Storage
export const uploadImages = uploadToMemory.array("images", MAX_FILES);

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  console.log("📁 [MULTER] Error handler triggered");
  console.log("📁 [MULTER] Error:", err);

  if (err instanceof multer.MulterError) {
    console.log("❌ [MULTER] MulterError:", err.code);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum is ${MAX_FILES} files`,
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err instanceof ValidationError) {
    console.log("❌ [MULTER] ValidationError:", err.message);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  console.log("✓ [MULTER] Passing error to next handler");
  next(err);
};

export default upload;
