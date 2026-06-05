import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { upload } from '../config/multer';

const router = express.Router();

router.get('/', getCategories);
router.post('/', verifyToken, requireAdmin, upload.single('image'), createCategory);
router.put('/:id', verifyToken, requireAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default router;
