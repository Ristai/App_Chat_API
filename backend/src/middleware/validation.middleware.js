import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Zod schema
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
}

// Common validation schemas
export const schemas = {
  register: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']).optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    name: z.string().min(1).max(100).optional(),
    photoUrl: z.string().url().optional(),
  }),

  createRoom: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['direct', 'group']),
    memberIds: z.array(z.string()).min(1, 'At least one member is required'),
  }),

  sendMessage: z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['text', 'image', 'file']).optional(),
    mediaUrl: z.string().url().optional(),
  }),

  friendRequest: z.object({
    toUserId: z.string().min(1, 'User ID is required'),
  }),
};
