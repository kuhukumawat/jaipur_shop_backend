"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.verifyToken);
router.get('/', cartController_1.getCart);
router.post('/items', cartController_1.addItem);
router.put('/items/:productId', cartController_1.updateItem);
router.delete('/items/:productId', cartController_1.removeItem);
router.delete('/', cartController_1.clearCart);
exports.default = router;
