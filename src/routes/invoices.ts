import express from 'express';
import { getInvoiceHTML } from '../controllers/invoiceController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.get('/:orderId/preview', verifyToken, getInvoiceHTML);

export default router;
