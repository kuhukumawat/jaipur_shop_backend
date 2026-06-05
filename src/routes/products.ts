import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/productController';
import { verifyToken, requireAdmin, optionalVerifyToken } from '../middleware/auth';
import { upload } from '../config/multer';

const router = express.Router();

router.get('/', optionalVerifyToken, getProducts);
router.get('/low-stock', verifyToken, requireAdmin, getLowStockProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
