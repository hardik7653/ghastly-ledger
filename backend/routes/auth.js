/**
 * Authentication Routes
 * Handles passphrase verification and JWT generation
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const APP_PASSPHRASE = process.env.APP_PASSPHRASE || '123';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_to_a_secure_random_string';
const TOKEN_EXPIRY = '24h'; // Token valid for 24 hours

/**
 * POST /api/auth
 * Verify passphrase and return JWT token
 */
router.post('/',
  [
    body('passphrase')
      .trim()
      .notEmpty()
      .withMessage('Passphrase is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid passphrase format')
  ],
  (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid request',
        errors: errors.array()
      });
    }

    const { passphrase } = req.body;

    // Verify passphrase
    if (passphrase === APP_PASSPHRASE) {
      // Generate JWT token
      const token = jwt.sign(
        { authenticated: true, timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return res.json({
        ok: true,
        token,
        message: 'Authentication successful'
      });
    } else {
      // Invalid passphrase
      return res.status(401).json({
        ok: false,
        message: 'Invalid passphrase'
      });
    }
  }
);

module.exports = router;
