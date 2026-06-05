import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

export const getCategories = async (req: Request, res: Response) => {
  const query = req.user?.role === 'admin' ? {} : { isActive: true };
  const categories = await Category.find(query).sort({ name: 1 });
  res.json({ success: true, data: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  const category = await Category.create({ name, description, image });
  res.status(201).json({ success: true, data: category, message: 'Category created' });
};

export const updateCategory = async (req: Request, res: Response) => {
  const data = { ...req.body };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category, message: 'Category updated' });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const productCount = await Product.countDocuments({ category: req.params.id, isActive: true });
  if (productCount > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete: ${productCount} active product(s) use this category`,
    });
  }
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
};
