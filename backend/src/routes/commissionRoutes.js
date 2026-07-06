const express = require('express');
const router = express.Router();
const { getCommissions, getMonthlyRevenue } = require('../controllers/commissionController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRole(['owner']), getCommissions);
router.get('/revenue', authenticateToken, authorizeRole(['owner']), getMonthlyRevenue);

module.exports = router;