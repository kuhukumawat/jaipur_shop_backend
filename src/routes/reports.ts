import express from 'express';
import { downloadInventoryExcel, downloadOrdersExcel } from '../controllers/reportController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken, requireAdmin);
router.get('/inventory/excel', downloadInventoryExcel);
router.get('/orders/excel', downloadOrdersExcel);

export default router;
