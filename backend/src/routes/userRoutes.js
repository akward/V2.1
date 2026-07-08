const express = require('express');
const router = express.Router();
const { addUser, getUsersByRole, getUserById } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Owner only routes
router.post('/', authenticateToken, authorizeRole(['owner']), addUser);

// Owner and admin can view users by role
router.get('/role/:role', authenticateToken, authorizeRole(['owner', 'admin']), getUsersByRole);

// Get user by ID
router.get('/:id', authenticateToken, getUserById);

module.exports = router;
