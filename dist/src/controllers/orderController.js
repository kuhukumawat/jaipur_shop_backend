"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.updatePaymentStatus = exports.updateOrderStatus = exports.getOrderById = exports.getAllOrders = exports.getUserOrders = exports.createOrder = void 0;
const orderService = __importStar(require("../services/orderService"));
const createOrder = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
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
exports.createOrder = createOrder;
const getUserOrders = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user._id.toString(), page, limit ? parseInt(limit) : 10);
    res.json({ success: true, data: result });
};
exports.getUserOrders = getUserOrders;
const getAllOrders = async (req, res) => {
    const { status, page, limit, search } = req.query;
    const result = await orderService.getAllOrders({
        status: status,
        page: page,
        limit: limit,
        search: search,
    });
    res.json({ success: true, data: result });
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const isAdmin = req.user.role === 'admin';
    const order = await orderService.getOrderById(req.params.id, req.user._id.toString(), isAdmin);
    res.json({ success: true, data: order });
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    if (!status)
        return res.status(400).json({ success: false, message: 'Status is required' });
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order, message: 'Order status updated' });
};
exports.updateOrderStatus = updateOrderStatus;
const updatePaymentStatus = async (req, res) => {
    const { paymentStatus } = req.body;
    if (!paymentStatus)
        return res.status(400).json({ success: false, message: 'Payment status is required' });
    const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus);
    res.json({ success: true, data: order, message: 'Payment status updated' });
};
exports.updatePaymentStatus = updatePaymentStatus;
const getOrderStats = async (req, res) => {
    const stats = await orderService.getOrderStats();
    res.json({ success: true, data: stats });
};
exports.getOrderStats = getOrderStats;
