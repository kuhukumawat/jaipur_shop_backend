const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, updatePaymentStatus, getOrderStats } = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/admin/all', requireAdmin, getAllOrders);
router.get('/admin/stats', requireAdmin, getOrderStats);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.put('/:id/payment', requireAdmin, updatePaymentStatus);

module.exports = router;
