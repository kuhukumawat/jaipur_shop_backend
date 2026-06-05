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
exports.getLowStockProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const productService = __importStar(require("../services/productService"));
const createProduct = async (req, res) => {
    const files = req.files || [];
    const images = files.map((f) => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
    }));
    const data = { ...req.body, images };
    if (req.body.tags && typeof req.body.tags === 'string') {
        data.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const product = await productService.createProduct(data);
    res.status(201).json({ success: true, data: product, message: 'Product created' });
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    const { search, page, limit } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const result = await productService.getProducts({
        search: search,
        page: page,
        limit: limit,
        isAdmin,
    });
    res.json({ success: true, data: result });
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    const data = { ...req.body };
    if (req.body.tags && typeof req.body.tags === 'string') {
        data.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const files = req.files || [];
    if (files && files.length > 0) {
        data.$push = {
            images: {
                $each: files.map((f) => ({ url: `/uploads/${f.filename}`, filename: f.filename })),
            },
        };
        delete data.images;
    }
    const product = await productService.updateProduct(req.params.id, data);
    res.json({ success: true, data: product, message: 'Product updated' });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    await productService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
};
exports.deleteProduct = deleteProduct;
const getLowStockProducts = async (req, res) => {
    const products = await productService.getLowStockProducts();
    res.json({ success: true, data: products });
};
exports.getLowStockProducts = getLowStockProducts;
