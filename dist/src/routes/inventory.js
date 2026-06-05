"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.verifyToken, auth_1.requireAdmin);
router.get('/', inventoryController_1.getInventoryOverview);
router.get('/low-stock', inventoryController_1.getLowStock);
router.get('/transactions', inventoryController_1.getTransactions);
router.post('/adjust', inventoryController_1.adjustStock);
exports.default = router;
