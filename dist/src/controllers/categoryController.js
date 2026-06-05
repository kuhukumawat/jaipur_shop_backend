"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
const getCategories = async (req, res) => {
    const query = req.user?.role === 'admin' ? {} : { isActive: true };
    const categories = await Category_1.default.find(query).sort({ name: 1 });
    res.json({ success: true, data: categories });
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name)
        return res.status(400).json({ success: false, message: 'Name is required' });
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const category = await Category_1.default.create({ name, description, image });
    res.status(201).json({ success: true, data: category, message: 'Category created' });
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const data = { ...req.body };
    if (req.file)
        data.image = `/uploads/${req.file.filename}`;
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!category)
        return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category, message: 'Category updated' });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const productCount = await Product_1.default.countDocuments({ category: req.params.id, isActive: true });
    if (productCount > 0) {
        return res.status(409).json({
            success: false,
            message: `Cannot delete: ${productCount} active product(s) use this category`,
        });
    }
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category)
        return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
};
exports.deleteCategory = deleteCategory;
