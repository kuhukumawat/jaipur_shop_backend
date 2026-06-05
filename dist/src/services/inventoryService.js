"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.getTransactions = exports.getLowStockProducts = exports.getInventoryOverview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = __importDefault(require("../models/Product"));
const InventoryTransaction_1 = __importDefault(require("../models/InventoryTransaction"));
const getInventoryOverview = async () => {
    const products = await Product_1.default.find({ isActive: true })
        .populate('category', 'name slug')
        .sort({ stock: 1 });
    return products.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        unit: p.unit,
        price: p.price,
        costPrice: p.costPrice,
        images: p.images,
        isLowStock: p.stock <= p.lowStockThreshold,
        stockValue: p.stock * p.costPrice,
    }));
};
exports.getInventoryOverview = getInventoryOverview;
const getLowStockProducts = async () => {
    return Product_1.default.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).populate('category', 'name');
};
exports.getLowStockProducts = getLowStockProducts;
const getTransactions = async (productId = null, page = 1, limit = 20) => {
    const query = {};
    if (productId)
        query.product = productId;
    const pNum = typeof page === 'string' ? parseInt(page) : page;
    const skip = (pNum - 1) * limit;
    const [transactions, total] = await Promise.all([
        InventoryTransaction_1.default.find(query)
            .populate('product', 'name sku')
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        InventoryTransaction_1.default.countDocuments(query),
    ]);
    return { transactions, total, page: pNum, pages: Math.ceil(total / limit) };
};
exports.getTransactions = getTransactions;
const adjustStock = async ({ productId, quantity, type, notes, performedBy }) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const product = await Product_1.default.findById(productId).session(session);
        if (!product)
            throw Object.assign(new Error('Product not found'), { statusCode: 404 });
        const stockBefore = product.stock;
        const adjustedQty = type === 'stock_out' ? -Math.abs(quantity) : Math.abs(quantity);
        const stockAfter = stockBefore + adjustedQty;
        if (stockAfter < 0) {
            throw Object.assign(new Error('Stock cannot go below 0'), { statusCode: 400 });
        }
        await Product_1.default.findByIdAndUpdate(productId, { stock: stockAfter }, { session });
        const [transaction] = await InventoryTransaction_1.default.create([{ product: productId, type, quantity: adjustedQty, stockBefore, stockAfter, notes, performedBy, referenceType: 'Manual' }], { session });
        await session.commitTransaction();
        return { product: await Product_1.default.findById(productId).populate('category', 'name'), transaction };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.adjustStock = adjustStock;
