"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeItem = exports.updateItem = exports.addItem = exports.getCart = void 0;
const mongoose_1 = require("mongoose");
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const getCart = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    let cart = await Cart_1.default.findOne({ user: req.user._id }).populate('items.product');
    if (!cart)
        cart = await Cart_1.default.create({ user: req.user._id, items: [] });
    res.json({ success: true, data: cart });
};
exports.getCart = getCart;
const addItem = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { productId, quantity = 1 } = req.body;
    if (!productId)
        return res.status(400).json({ success: false, message: 'productId is required' });
    const product = await Product_1.default.findById(productId);
    if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < quantity) {
        return res.status(409).json({ success: false, message: `Only ${product.stock} items in stock` });
    }
    let cart = await Cart_1.default.findOne({ user: req.user._id });
    if (!cart)
        cart = new Cart_1.default({ user: req.user._id, items: [] });
    const existingIdx = cart.items.findIndex((i) => i.product.toString() === productId);
    const existingQty = existingIdx > -1 ? cart.items[existingIdx].quantity : 0;
    const totalQty = existingQty + parseInt(quantity);
    if (product.stock < totalQty) {
        return res.status(409).json({ success: false, message: `Only ${product.stock} items in stock` });
    }
    if (existingIdx > -1) {
        cart.items[existingIdx].quantity = totalQty;
    }
    else {
        cart.items.push({
            product: new mongoose_1.Types.ObjectId(productId),
            quantity: parseInt(quantity),
            addedAt: new Date()
        });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Item added to cart' });
};
exports.addItem = addItem;
const updateItem = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { quantity } = req.body;
    const { productId } = req.params;
    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }
    const cart = await Cart_1.default.findOne({ user: req.user._id });
    if (!cart)
        return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item)
        return res.status(404).json({ success: false, message: 'Item not in cart' });
    item.quantity = parseInt(quantity);
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Cart updated' });
};
exports.updateItem = updateItem;
const removeItem = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { productId } = req.params;
    const cart = await Cart_1.default.findOne({ user: req.user._id });
    if (!cart)
        return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');
    res.json({ success: true, data: cart, message: 'Item removed' });
};
exports.removeItem = removeItem;
const clearCart = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    await Cart_1.default.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
};
exports.clearCart = clearCart;
