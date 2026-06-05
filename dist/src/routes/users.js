"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.verifyToken, auth_1.requireAdmin);
router.get('/', userController_1.getAllUsers);
router.get('/:id', userController_1.getUserById);
router.put('/:id/role', userController_1.updateUserRole);
router.put('/:id/status', userController_1.updateUserStatus);
router.delete('/:id', userController_1.deleteUser);
exports.default = router;
