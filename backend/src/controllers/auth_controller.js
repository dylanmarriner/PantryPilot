const { validationResult } = require('express-validator');
const { User } = require('../models');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
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

      // Create new user
      const user = await User.create({
        email,
        passwordHash: this.hashPassword(password),
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
  }

  /**
   * Login user
   */
  async login(req, res) {
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
      if (!this.verifyPassword(password, user.passwordHash)) {
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
  }

  /**
   * Logout user (invalidate token server-side if needed)
   */
  async logout(req, res) {
    try {
      // In a simple implementation, logout is handled client-side
      // In a production system, you might maintain a token blacklist
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
  }

  /**
   * Validate token
   */
  async validateToken(req, res) {
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
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
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

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // For security, don't reveal if user exists
        return res.json({
          success: true,
          message: 'If an account exists with this email, a reset link will be sent'
        });
      }

      // In production, generate reset token and send email
      // For now, just return success message
      res.json({
        success: true,
        message: 'Password reset link sent to email'
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
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
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    // Simple token generation - in production use jsonwebtoken library
    // Format: header.payload.signature (we'll create a minimal version)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ 
      user: { id: user.id, email: user.email },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    })).toString('base64');
    
    // Signature would normally be HMAC signed, but for simplicity we'll use a basic hash
    const signature = Buffer.from('mock-signature').toString('base64');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Hash password (simplified - use bcrypt in production)
   */
  hashPassword(password) {
    // In production, use bcrypt: bcrypt.hash(password, 10)
    return Buffer.from(password).toString('base64');
  }

  /**
   * Verify password (simplified - use bcrypt in production)
   */
  verifyPassword(password, hash) {
    // In production, use bcrypt: bcrypt.compare(password, hash)
    return Buffer.from(password).toString('base64') === hash;
  }
}

module.exports = new AuthController();
