import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, data: cart });
};

export const addItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (product.stock < quantity) {
    return res.status(409).json({ success: false, message: `Only ${product.stock} items in stock` });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex((i: any) => i.product.toString() === productId);
  const existingQty = existingIdx > -1 ? cart.items[existingIdx].quantity : 0;
  const totalQty = existingQty + parseInt(quantity as any);
  if (product.stock < totalQty) {
    return res.status(409).json({ success: false, message: `Only ${product.stock} items in stock` });
  }

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity = totalQty;
  } else {
    cart.items.push({ product: productId, quantity: parseInt(quantity as any) } as any);
  }

  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, data: cart, message: 'Item added to cart' });
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const item = cart.items.find((i: any) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  item.quantity = parseInt(quantity as any);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, data: cart, message: 'Cart updated' });
};

export const removeItem = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  cart.items = cart.items.filter((i: any) => i.product.toString() !== productId) as any;
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, data: cart, message: 'Item removed' });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
};
