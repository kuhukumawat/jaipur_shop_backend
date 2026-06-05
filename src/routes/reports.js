const express = require('express');
const router = express.Router();
const { downloadInventoryExcel, downloadOrdersExcel } = require('../controllers/reportController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);
router.get('/inventory/excel', downloadInventoryExcel);
router.get('/orders/excel', downloadOrdersExcel);

module.exports = router;
