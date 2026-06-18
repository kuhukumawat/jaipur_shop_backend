import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public — anyone can fetch categories (for filtering products on frontend)
router.get('/', getCategories);

// Admin only — create, edit, delete
router.post('/', verifyToken, requireAdmin, createCategory);
router.put('/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;
