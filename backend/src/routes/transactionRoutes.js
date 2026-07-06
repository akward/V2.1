const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction } = require('../controllers/transactionController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, getTransactions);
router.post('/', authenticateToken, authorizeRole(['seller']), createTransaction);

module.exports = router;