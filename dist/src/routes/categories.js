"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../config/multer");
const router = express_1.default.Router();
router.get('/', categoryController_1.getCategories);
router.post('/', auth_1.verifyToken, auth_1.requireAdmin, multer_1.upload.single('image'), categoryController_1.createCategory);
router.put('/:id', auth_1.verifyToken, auth_1.requireAdmin, multer_1.upload.single('image'), categoryController_1.updateCategory);
router.delete('/:id', auth_1.verifyToken, auth_1.requireAdmin, categoryController_1.deleteCategory);
exports.default = router;
