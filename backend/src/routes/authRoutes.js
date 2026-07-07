const express = require('express');
const router = express.Router();
const { login, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Tambahkan endpoint test sederhana
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth route is working!',
        timestamp: new Date().toISOString(),
        env: {
            supabaseUrl: process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set',
            supabaseKey: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set',
            jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'
        }
    });
});

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
