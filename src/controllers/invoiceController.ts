import { Response } from 'express';
import * as orderService from '../services/orderService';
import * as invoiceService from '../services/invoiceService';
import { AuthRequest } from '../middleware/auth';

export const getInvoiceHTML = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrderById(req.params.orderId, req.user._id as string, isAdmin);
  const html = invoiceService.generateInvoiceHTML(order);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
