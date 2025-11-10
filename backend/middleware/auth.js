/**
 * JWT Authentication Middleware
 * Verifies JWT tokens for protected routes
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_to_a_secure_random_string';

/**
 * Middleware to verify JWT token from Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        ok: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded; // Attach decoded token to request
    next();
  });
}

module.exports = { authenticateToken };
