"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.verifyToken);
router.post('/', orderController_1.createOrder);
router.get('/', orderController_1.getUserOrders);
router.get('/admin/all', auth_1.requireAdmin, orderController_1.getAllOrders);
router.get('/admin/stats', auth_1.requireAdmin, orderController_1.getOrderStats);
router.get('/:id', orderController_1.getOrderById);
router.put('/:id/status', auth_1.requireAdmin, orderController_1.updateOrderStatus);
router.put('/:id/payment', auth_1.requireAdmin, orderController_1.updatePaymentStatus);
exports.default = router;
