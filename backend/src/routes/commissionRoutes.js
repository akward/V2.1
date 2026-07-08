const express = require('express');
const router = express.Router();
const { getCommissions, getMonthlyRevenue } = require('../controllers/commissionController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Semua user yang login bisa melihat komisi (dengan filter berdasarkan role di controller)
router.get('/', authenticateToken, getCommissions);

// Hanya owner yang bisa melihat revenue
router.get('/revenue', authenticateToken, authorizeRole(['owner']), getMonthlyRevenue);

module.exports = router;
