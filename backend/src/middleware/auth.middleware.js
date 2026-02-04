import { verifyAccessToken } from '../utils/jwt.util.js';
import { AuthenticationError } from '../utils/errors.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
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
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
}
