import crypto from 'crypto';
import mongoose, { Types, FilterQuery } from 'mongoose';
import Order, { IOrderDocument, IOrderItem } from '../models/Order';
import Product from '../models/Product';
import Cart from '../models/Cart';
import InventoryTransaction from '../models/InventoryTransaction';

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase(); // 16M+ possibilities
  return `INV-${y}${m}${d}-${rand}`;
};

interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderParams {
  userId: string | Types.ObjectId;
  items: CreateOrderItemInput[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod?: 'cod' | 'online' | 'upi';
  notes?: string;
}

export const createOrder = async ({ userId, items, shippingAddress, paymentMethod, notes }: CreateOrderParams) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems: (IOrderItem & { product: mongoose.Types.ObjectId })[] = [];
    const stockMap = new Map<string, number>();
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.isActive) {
        throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
      }
      if (product.stock < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`),
          { statusCode: 409 }
        );
      }

      stockMap.set(product._id.toString(), product.stock);

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const [order] = await Order.create(
      [
        {
          invoiceNumber: generateInvoiceNumber(),
          user: userId,
          items: orderItems,
          shippingAddress,
          subtotal,
          tax,
          total,
          paymentMethod: paymentMethod || 'cod',
          notes,
        },
      ],
      { session }
    );

    for (const item of orderItems) {
      const stockBefore = stockMap.get(item.product.toString())!;
      const stockAfter = stockBefore - item.quantity;

      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { session }
      );

      await InventoryTransaction.create(
        [
          {
            product: item.product,
            type: 'order',
            quantity: -item.quantity,
            stockBefore,
            stockAfter,
            referenceId: order._id,
            referenceType: 'Order',
            notes: `Order ${order.invoiceNumber}`,
            performedBy: userId,
          },
        ],
        { session }
      );
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });

    await session.commitTransaction();

    return Order.findById(order._id)
      .populate('user', 'name email phone address')
      .populate('items.product', 'name sku images');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getOrderById = async (orderId: string, userId: string | null = null, isAdmin = false) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email phone address')
    .populate('items.product', 'name sku images');

  if (!order) {
    throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  }
  if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  return order;
};

export const getUserOrders = async (userId: string, page: number | string = 1, limit = 10) => {
  const pNum = typeof page === 'string' ? parseInt(page) : page;
  const skip = (pNum - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .populate('items.product', 'name sku images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: userId }),
  ]);
  return { orders, total, page: pNum, pages: Math.ceil(total / limit) };
};

interface GetAllOrdersParams {
  status?: string;
  page?: number | string;
  limit?: number | string;
  search?: string;
}

export const getAllOrders = async ({ status, page = 1, limit = 20, search }: GetAllOrdersParams = {}) => {
  const query: FilterQuery<IOrderDocument> = {};
  if (status) query.status = status;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.invoiceNumber = { $regex: safe, $options: 'i' };
  }

  const pNum = typeof page === 'string' ? parseInt(page) : page;
  const lNum = typeof limit === 'string' ? parseInt(limit) : limit;
  const skip = (pNum - 1) * lNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lNum),
    Order.countDocuments(query),
  ]);
  return { orders, total, page: pNum, pages: Math.ceil(total / lNum) };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return order;
};

export const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
  const order = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return order;
};

export const getOrderStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalRevenueResult, thisMonthResult, lastMonthResult, totalOrders, thisMonthOrders, revenueByDay] =
    await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  return {
    totalRevenue: totalRevenueResult[0]?.total || 0,
    thisMonthRevenue: thisMonthResult[0]?.total || 0,
    lastMonthRevenue: lastMonthResult[0]?.total || 0,
    totalOrders,
    thisMonthOrders,
    revenueByDay,
  };
};
