"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowStockProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const createProduct = async (data) => {
    const product = await Product_1.default.create(data);
    return Product_1.default.findById(product._id).populate('category', 'name slug');
};
exports.createProduct = createProduct;
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getProducts = async ({ search, category, page = 1, limit = 12, isAdmin = false, } = {}) => {
    const query = {};
    if (!isAdmin)
        query.isActive = true;
    if (category)
        query.category = category;
    if (search) {
        const safe = escapeRegex(search);
        query.$or = [
            { name: { $regex: safe, $options: 'i' } },
            { description: { $regex: safe, $options: 'i' } },
            { sku: { $regex: safe, $options: 'i' } },
        ];
    }
    const pNum = typeof page === 'string' ? parseInt(page) : page;
    const lNum = typeof limit === 'string' ? parseInt(limit) : limit;
    const skip = (pNum - 1) * lNum;
    const [products, total] = await Promise.all([
        Product_1.default.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(lNum),
        Product_1.default.countDocuments(query),
    ]);
    return {
        products,
        total,
        page: pNum,
        pages: Math.ceil(total / lNum),
    };
};
exports.getProducts = getProducts;
const getProductById = async (id) => {
    const product = await Product_1.default.findById(id).populate('category', 'name slug');
    if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return product;
};
exports.getProductById = getProductById;
const updateProduct = async (id, data) => {
    const product = await Product_1.default.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).populate('category', 'name slug');
    if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return product;
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    const product = await Product_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) {
        throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return product;
};
exports.deleteProduct = deleteProduct;
const getLowStockProducts = async () => {
    return Product_1.default.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).populate('category', 'name slug');
};
exports.getLowStockProducts = getLowStockProducts;
