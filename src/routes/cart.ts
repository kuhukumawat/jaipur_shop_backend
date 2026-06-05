import express from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cartController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken);
router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;
