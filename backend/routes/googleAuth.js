const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Redirect to Google for authentication
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google callback route
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login',
    session: false,
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Prepare user data
      const userData = {
        id: req.user.id,
        firstName: req.user.firstName || req.user.name?.split(' ')[0] || req.user.name,
        lastName: req.user.lastName || req.user.name?.split(' ').slice(1).join(' ') || '',
        email: req.user.email,
        role: req.user.role || 'customer',
        avatar: req.user.avatar || null,
        isVerified: req.user.isVerified || false,
        phoneNumber: req.user.phoneNumber || null,
        isPremium: req.user.isPremium || false,
        premiumSince: req.user.premiumSince || null,
        premiumExpiresAt: req.user.premiumExpiresAt || null,
      };

      // Redirect to frontend with token and user data
      // Frontend will extract these from URL and store in localStorage
      const frontendUrl = `http://localhost:5173/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      res.redirect(frontendUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('http://localhost:5173/login?error=authentication_failed');
    }
  }
);

module.exports = router;
