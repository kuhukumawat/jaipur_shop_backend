import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
} from '../controllers/orderController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/admin/all', requireAdmin, getAllOrders);
router.get('/admin/stats', requireAdmin, getOrderStats);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.put('/:id/payment', requireAdmin, updatePaymentStatus);

export default router;
