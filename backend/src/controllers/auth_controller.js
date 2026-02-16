const { validationResult } = require('express-validator');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
  /**
   * Register a new user
   */
  register = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create new user
      const user = await User.create({
        email,
        passwordHash,
        firstName: email.split('@')[0],
        lastName: 'User'
      });

      const token = this.generateToken(user);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      });
    } catch (error) {
      console.error('Registration failed:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Login user
   */
  login = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValid = await this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = this.generateToken(user);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Logout user (invalidate token server-side if needed)
   */
  logout = async (req, res) => {
    try {
      // In a simple JWT implementation, logout is client-side (delete token)
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  };

  /**
   * Validate token
   */
  validateToken = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Token validation failed'
      });
    }
  };

  /**
   * Reset password
   */
  resetPassword = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;
      // In production, initiate password reset flow
      res.json({
        success: true,
        message: 'If an account exists, a reset link will be sent'
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['email', 'firstName', 'lastName'];
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      }

      await user.save();

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Generate JWT token
   */
  generateToken = (user) => {
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-prod',
      { expiresIn: '7d' }
    );
  };

  /**
   * Hash password using bcrypt
   */
  hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };

  /**
   * Verify password using bcrypt
   */
  verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
  };
}

module.exports = new AuthController();
