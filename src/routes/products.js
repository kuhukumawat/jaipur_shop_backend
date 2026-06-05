const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { upload } = require('../config/multer');

router.get('/', verifyToken, getProducts);
router.get('/low-stock', verifyToken, requireAdmin, getLowStockProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), createProduct);
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
