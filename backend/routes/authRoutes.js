// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Local auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),
    (req, res) => {
        try {
            const token = require('jsonwebtoken').sign({
                    id: req.user.id,
                    email: req.user.email
                },
                process.env.JWT_SECRET || 'your-jwt-secret', { expiresIn: '24h' }
            );

            res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
        }
    }
);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;