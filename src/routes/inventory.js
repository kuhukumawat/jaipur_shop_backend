const express = require('express');
const router = express.Router();
const { getInventoryOverview, getLowStock, getTransactions, adjustStock } = require('../controllers/inventoryController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);
router.get('/', getInventoryOverview);
router.get('/low-stock', getLowStock);
router.get('/transactions', getTransactions);
router.post('/adjust', adjustStock);

module.exports = router;
