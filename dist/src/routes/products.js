"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
router.get('/', auth_1.optionalVerifyToken, productController_1.getProducts);
router.get('/low-stock', auth_1.verifyToken, auth_1.requireAdmin, productController_1.getLowStockProducts);
router.get('/:id', productController_1.getProductById);
router.post('/', auth_1.verifyToken, auth_1.requireAdmin, multer_1.upload.array('images', 5), productController_1.createProduct);
router.put('/:id', auth_1.verifyToken, auth_1.requireAdmin, multer_1.upload.array('images', 5), productController_1.updateProduct);
router.delete('/:id', auth_1.verifyToken, auth_1.requireAdmin, productController_1.deleteProduct);
exports.default = router;
