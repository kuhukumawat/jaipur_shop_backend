import express from 'express';
import { getInventoryOverview, getLowStock, getTransactions, adjustStock } from '../controllers/inventoryController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken, requireAdmin);
router.get('/', getInventoryOverview);
router.get('/low-stock', getLowStock);
router.get('/transactions', getTransactions);
router.post('/adjust', adjustStock);

export default router;
