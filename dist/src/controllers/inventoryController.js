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
exports.adjustStock = exports.getTransactions = exports.getLowStock = exports.getInventoryOverview = void 0;
const inventoryService = __importStar(require("../services/inventoryService"));
const getInventoryOverview = async (req, res) => {
    const data = await inventoryService.getInventoryOverview();
    res.json({ success: true, data });
};
exports.getInventoryOverview = getInventoryOverview;
const getLowStock = async (req, res) => {
    const data = await inventoryService.getLowStockProducts();
    res.json({ success: true, data });
};
exports.getLowStock = getLowStock;
const getTransactions = async (req, res) => {
    const { productId, page, limit } = req.query;
    const result = await inventoryService.getTransactions(productId, page, limit ? parseInt(limit) : 20);
    res.json({ success: true, data: result });
};
exports.getTransactions = getTransactions;
const ALLOWED_TYPES = ['stock_in', 'stock_out', 'adjustment'];
const adjustStock = async (req, res) => {
    const { productId, quantity, type, notes } = req.body;
    if (!productId || !quantity || !type) {
        return res.status(400).json({ success: false, message: 'productId, quantity, and type are required' });
    }
    if (!ALLOWED_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: `type must be one of: ${ALLOWED_TYPES.join(', ')}` });
    }
    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({ success: false, message: 'quantity must be a positive integer' });
    }
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const result = await inventoryService.adjustStock({
        productId,
        quantity: parsedQty,
        type: type,
        notes,
        performedBy: req.user._id,
    });
    res.json({ success: true, data: result, message: 'Stock adjusted successfully' });
};
exports.adjustStock = adjustStock;
