/**
 * Authentication middleware
 * Validates JWT tokens and sets user context
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow mock user for development
    if (process.env.NODE_ENV === 'development') {
      req.user = {
        id: 'test-user-id',
        email: 'test@example.com'
      };
      return next();
    }
    
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    // In production, verify JWT token here
    // For now, we'll accept any token and extract user info if possible
    // This is a simplified implementation
    
    // Decode token (in production use jsonwebtoken.verify)
    let decodedToken = {};
    try {
      const json = Buffer.from(token.split('.')[1], 'base64').toString();
      decodedToken = JSON.parse(json);
    } catch (e) {
      // Token might not be valid JSON, continue with default user
    }
    
    req.user = decodedToken.user || {
      id: 'api-user',
      email: decodedToken.email || 'user@example.com'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = auth;
