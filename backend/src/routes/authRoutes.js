const express = require('express');
const router = express.Router();
const { login, getCurrentUser, testUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.get('/test-users', testUsers); // Endpoint untuk debugging

module.exports = router;
