/**
 * Authentication middleware
 * Validates JWT tokens and sets user context
 */
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow mock user for development ONLY if explicit environment variable is set for it, 
    // but better to enforce real auth even in dev to match prod.
    // For now, we will return 401 to enforce strict security as requested.
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-do-not-use-in-prod');

    // Attach user to request
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

/**
 * Admin authorization middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required'
    });
  }
};

module.exports = { auth, adminOnly };
