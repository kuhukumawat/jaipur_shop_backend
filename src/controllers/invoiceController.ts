import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import * as invoiceService from '../services/invoiceService';

export const getInvoiceHTML = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrderById(req.params.orderId, req.user._id.toString(), isAdmin);
  const html = invoiceService.generateInvoiceHTML(order);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
