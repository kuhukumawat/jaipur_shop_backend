import { Response } from 'express';
import * as inventoryService from '../services/inventoryService';
import { AuthRequest } from '../middleware/auth';

export const getInventoryOverview = async (req: AuthRequest, res: Response) => {
  const data = await inventoryService.getInventoryOverview();
  res.json({ success: true, data });
};

export const getLowStock = async (req: AuthRequest, res: Response) => {
  const data = await inventoryService.getLowStockProducts();
  res.json({ success: true, data });
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const { productId, page, limit } = req.query;
  const result = await inventoryService.getTransactions(
    productId as string | null,
    page as string,
    limit ? parseInt(limit as string) : 20
  );
  res.json({ success: true, data: result });
};

const ALLOWED_TYPES = ['stock_in', 'stock_out', 'adjustment'];

export const adjustStock = async (req: AuthRequest, res: Response) => {
  const { productId, quantity, type, notes } = req.body;
  if (!productId || !quantity || !type) {
    return res.status(400).json({ success: false, message: 'productId, quantity, and type are required' });
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: `type must be one of: ${ALLOWED_TYPES.join(', ')}` });
  }
  const parsedQty = parseInt(quantity);
  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ success: false, message: 'quantity must be a positive integer' });
  }
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const result = await inventoryService.adjustStock({
    productId,
    quantity: parsedQty,
    type: type as any,
    notes,
    performedBy: req.user._id,
  });
  res.json({ success: true, data: result, message: 'Stock adjusted successfully' });
};
