import admin from "firebase-admin";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { AuthenticationError } from "../utils/errors.js";

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(req, res, next) {
  try {
    console.log("🔐 [AUTH] Request:", req.method, req.path);

    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ [AUTH] No token provided");
      throw new AuthenticationError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    try {
      // 1. Try Custom JWT first
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (jwtError) {
      // 2. Fallback to Firebase ID Token
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
          userId: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || "user", // Firebase custom claims or default
        };
      } catch (firebaseError) {
        // Log the actual error for debugging
        console.error(
          "Firebase Token Verification Failed:",
          firebaseError.message,
        );
        console.error("Token received:", token.substring(0, 10) + "...");

        // If both fail, throw original error or a generic one
        throw new AuthenticationError("Invalid authentication token");
      }
    }

    console.log("✓ [AUTH] Authenticated:", req.user.email);
    next();
  } catch (error) {
    console.log("❌ [AUTH] Error:", error.message);
    next(error);
  }
}

/**
 * Admin authorization middleware
 * Checks if user has admin role
 */
export function adminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      throw new AuthenticationError("Authentication required");
    }

    if (req.user.role !== "admin") {
      throw new AuthenticationError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
}
