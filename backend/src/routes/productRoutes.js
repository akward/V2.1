const express = require('express');
const router = express.Router();
const { getProducts, addProduct, editProductPrice } = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, getProducts);
router.post('/', authenticateToken, authorizeRole(['admin']), addProduct);
router.put('/:id/price', authenticateToken, authorizeRole(['admin']), editProductPrice);

module.exports = router;