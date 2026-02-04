import { verifyAccessToken } from '../utils/jwt.util.js';

/**
 * Socket.IO authentication middleware
 * Verifies JWT token from handshake auth
 */
export function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user data to socket
    socket.userId = decoded.userId;
    socket.email = decoded.email;
    socket.role = decoded.role;

    next();
  } catch (error) {
    next(new Error('Authentication failed: ' + error.message));
  }
}
