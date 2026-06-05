const express = require('express');
const router = express.Router();
const { getInvoiceHTML } = require('../controllers/invoiceController');
const { verifyToken } = require('../middleware/auth');

router.get('/:orderId/preview', verifyToken, getInvoiceHTML);

module.exports = router;
