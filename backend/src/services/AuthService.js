import { getFirestore, getAuth } from '../config/firebase.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { AuthenticationError, ValidationError, ConflictError } from '../utils/errors.js';

class AuthService {
  constructor() {
    this.db = null;
    this.auth = null;
  }

  _getDb() {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  _getAuth() {
    if (!this.auth) {
      this.auth = getAuth();
    }
    return this.auth;
  }

  /**
   * Register a new user
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} User and tokens
   */
  async register({ name, email, password, role = 'user' }) {
    // Validation
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const db = this._getDb();
    const auth = this._getAuth();

    // Check if user already exists
    const usersRef = db.collection('users');
    const existingUserQuery = await usersRef.where('email', '==', email.trim().toLowerCase()).limit(1).get();
    
    if (!existingUserQuery.empty) {
      throw new ConflictError('Email already registered');
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({
        email: email.trim().toLowerCase(),
        password: password,
        displayName: name.trim(),
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictError('Email already registered');
      }
      throw error;
    }

    // Hash password for storage
    const hashedPassword = await hashPassword(password);

    // Create user document in Firestore
    const userData = {
      uid: firebaseUser.uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      photoUrl: '',
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      fcmToken: '',
    };

    await usersRef.doc(firebaseUser.uid).set(userData);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: firebaseUser.uid,
      email: userData.email,
      role: userData.role,
    });

    const refreshToken = generateRefreshToken({
      userId: firebaseUser.uid,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User and tokens
   */
  async login({ email, password }) {
    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const db = this._getDb();

    // Find user by email
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', email.trim().toLowerCase()).limit(1).get();

    if (userQuery.empty) {
      throw new AuthenticationError('Invalid email or password');
    }

    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update online status
    await usersRef.doc(user.uid).update({
      isOnline: true,
      lastSeen: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.uid,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async logout(userId) {
    const db = this._getDb();
    await db.collection('users').doc(userId).update({
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    const db = this._getDb();

    // Find user
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      throw new AuthenticationError('User not found');
    }

    const user = { id: userDoc.id, ...userDoc.data() };

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.uid,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Get current user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getCurrentUser(userId) {
    const db = this._getDb();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new AuthenticationError('User not found');
    }

    const user = { id: userDoc.id, ...userDoc.data() };
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();
