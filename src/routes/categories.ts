import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = express.Router();

router.get('/', getCategories as any);
router.post('/', verifyToken as any, requireAdmin as any, upload.single('image') as any, createCategory as any);
router.put('/:id', verifyToken as any, requireAdmin as any, upload.single('image') as any, updateCategory as any);
router.delete('/:id', verifyToken as any, requireAdmin as any, deleteCategory as any);

export default router;
