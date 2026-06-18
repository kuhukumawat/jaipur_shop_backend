import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService';

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json({ success: true, data: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ success: false, message: 'Title is required' });
    return;
  }
  const category = await categoryService.createCategory(title);
  res.status(201).json({ success: true, data: category, message: 'Category created' });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ success: false, message: 'Title is required' });
    return;
  }
  const category = await categoryService.updateCategory(req.params.id, title);
  res.json({ success: true, data: category, message: 'Category updated' });
};

export const deleteCategory = async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};
