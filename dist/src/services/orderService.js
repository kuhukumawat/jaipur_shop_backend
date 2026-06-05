"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.updatePaymentStatus = exports.updateOrderStatus = exports.getAllOrders = exports.getUserOrders = exports.getOrderById = exports.createOrder = exports.generateInvoiceNumber = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Cart_1 = __importDefault(require("../models/Cart"));
const InventoryTransaction_1 = __importDefault(require("../models/InventoryTransaction"));
const generateInvoiceNumber = () => {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const rand = crypto_1.default.randomBytes(3).toString('hex').toUpperCase(); // 16M+ possibilities
    return `INV-${y}${m}${d}-${rand}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const createOrder = async ({ userId, items, shippingAddress, paymentMethod, notes }) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const orderItems = [];
        const stockMap = new Map();
        let subtotal = 0;
        for (const item of items) {
            const product = await Product_1.default.findById(item.productId).session(session);
            if (!product || !product.isActive) {
                throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 404 });
            }
            if (product.stock < item.quantity) {
                throw Object.assign(new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`), { statusCode: 409 });
            }
            stockMap.set(product._id.toString(), product.stock);
            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal,
            });
        }
        const tax = parseFloat((subtotal * 0.18).toFixed(2));
        const total = parseFloat((subtotal + tax).toFixed(2));
        const [order] = await Order_1.default.create([
            {
                invoiceNumber: (0, exports.generateInvoiceNumber)(),
                user: userId,
                items: orderItems,
                shippingAddress,
                subtotal,
                tax,
                total,
                paymentMethod: paymentMethod || 'cod',
                notes,
            },
        ], { session });
        for (const item of orderItems) {
            const stockBefore = stockMap.get(item.product.toString());
            const stockAfter = stockBefore - item.quantity;
            await Product_1.default.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }, { session });
            await InventoryTransaction_1.default.create([
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
            ], { session });
        }
        await Cart_1.default.findOneAndUpdate({ user: userId }, { items: [] }, { session });
        await session.commitTransaction();
        return Order_1.default.findById(order._id)
            .populate('user', 'name email phone address')
            .populate('items.product', 'name images');
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.createOrder = createOrder;
const getOrderById = async (orderId, userId = null, isAdmin = false) => {
    const order = await Order_1.default.findById(orderId)
        .populate('user', 'name email phone address')
        .populate('items.product', 'name  images');
    if (!order) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
        throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }
    return order;
};
exports.getOrderById = getOrderById;
const getUserOrders = async (userId, page = 1, limit = 10) => {
    const pNum = typeof page === 'string' ? parseInt(page) : page;
    const skip = (pNum - 1) * limit;
    const [orders, total] = await Promise.all([
        Order_1.default.find({ user: userId })
            .populate('items.product', 'name  images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order_1.default.countDocuments({ user: userId }),
    ]);
    return { orders, total, page: pNum, pages: Math.ceil(total / limit) };
};
exports.getUserOrders = getUserOrders;
const getAllOrders = async ({ status, page = 1, limit = 20, search } = {}) => {
    const query = {};
    if (status)
        query.status = status;
    if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.invoiceNumber = { $regex: safe, $options: 'i' };
    }
    const pNum = typeof page === 'string' ? parseInt(page) : page;
    const lNum = typeof limit === 'string' ? parseInt(limit) : limit;
    const skip = (pNum - 1) * lNum;
    const [orders, total] = await Promise.all([
        Order_1.default.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(lNum),
        Order_1.default.countDocuments(query),
    ]);
    return { orders, total, page: pNum, pages: Math.ceil(total / lNum) };
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (orderId, status) => {
    const order = await Order_1.default.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
    if (!order)
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
};
exports.updateOrderStatus = updateOrderStatus;
const updatePaymentStatus = async (orderId, paymentStatus) => {
    const order = await Order_1.default.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
    if (!order)
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
};
exports.updatePaymentStatus = updatePaymentStatus;
const getOrderStats = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [totalRevenueResult, thisMonthResult, lastMonthResult, totalOrders, thisMonthOrders, revenueByDay] = await Promise.all([
        Order_1.default.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order_1.default.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order_1.default.countDocuments(),
        Order_1.default.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order_1.default.aggregate([
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
exports.getOrderStats = getOrderStats;
