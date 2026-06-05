import express from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cartController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken as any);
router.get('/', getCart as any);
router.post('/items', addItem as any);
router.put('/items/:productId', updateItem as any);
router.delete('/items/:productId', removeItem as any);
router.delete('/', clearCart as any);

export default router;
