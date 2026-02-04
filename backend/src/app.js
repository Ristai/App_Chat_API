import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import friendshipRoutes from './routes/friendship.routes.js';
import roomRoutes from './routes/room.routes.js';
import messageRoutes from './routes/message.routes.js';
import configRoutes from './routes/config.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Chat API v1.0' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Friendship routes
app.use('/api/friendships', friendshipRoutes);

// Room routes
app.use('/api/rooms', roomRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Config routes (Firebase, Zego keys)
app.use('/api/config', configRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
