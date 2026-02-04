import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import { InvalidTokenError, TokenExpiredError } from './errors.js';

/**
 * Generate access token
 * @param {Object} payload - Token payload (userId, email, role)
 * @returns {string} JWT access token
 */
export function generateAccessToken(payload) {
  try {
    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
}

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (userId)
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(payload) {
  try {
    const token = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Access token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError('Invalid access token');
    }
    throw new Error(`Failed to verify access token: ${error.message}`);
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new InvalidTokenError('Invalid refresh token');
    }
    throw new Error(`Failed to verify refresh token: ${error.message}`);
  }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
export function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error(`Failed to decode token: ${error.message}`);
  }
}
