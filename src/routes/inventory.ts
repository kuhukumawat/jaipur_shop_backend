import express from 'express';
import { getInventoryOverview, getLowStock, getTransactions, adjustStock } from '../controllers/inventoryController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken as any, requireAdmin as any);
router.get('/', getInventoryOverview as any);
router.get('/low-stock', getLowStock as any);
router.get('/transactions', getTransactions as any);
router.post('/adjust', adjustStock as any);

export default router;
