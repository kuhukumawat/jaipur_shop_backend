import { Response } from 'express';
import * as orderService from '../services/orderService';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { items, shippingAddress, paymentMethod, notes } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Order items are required' });
  }
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
    return res.status(400).json({ success: false, message: 'Shipping address (street, city, pincode) is required' });
  }
  const order = await orderService.createOrder({
    userId: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    notes,
  });
  res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { page, limit } = req.query;
  const result = await orderService.getUserOrders(
    req.user._id as string,
    page as string,
    limit ? parseInt(limit as string) : 10
  );
  res.json({ success: true, data: result });
};

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { status, page, limit, search } = req.query;
  const result = await orderService.getAllOrders({
    status: status as string,
    page: page as string,
    limit: limit as string,
    search: search as string,
  });
  res.json({ success: true, data: result });
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrderById(req.params.id, req.user._id as string, isAdmin);
  res.json({ success: true, data: order });
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.json({ success: true, data: order, message: 'Order status updated' });
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  const { paymentStatus } = req.body;
  if (!paymentStatus) return res.status(400).json({ success: false, message: 'Payment status is required' });
  const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus);
  res.json({ success: true, data: order, message: 'Payment status updated' });
};

export const getOrderStats = async (req: AuthRequest, res: Response) => {
  const stats = await orderService.getOrderStats();
  res.json({ success: true, data: stats });
};
