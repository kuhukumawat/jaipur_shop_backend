"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserStatus = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
            { name: { $regex: safe, $options: 'i' } },
            { email: { $regex: safe, $options: 'i' } },
        ];
    }
    const pNum = typeof page === 'string' ? parseInt(page) : page;
    const lNum = typeof limit === 'string' ? parseInt(limit) : limit;
    const skip = (pNum - 1) * lNum;
    const [users, total] = await Promise.all([
        User_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(lNum),
        User_1.default.countDocuments(query),
    ]);
    res.json({ success: true, data: { users, total, page: pNum, pages: Math.ceil(total / lNum) } });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
};
exports.getUserById = getUserById;
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: 'User role updated' });
};
exports.updateUserRole = updateUserRole;
const updateUserStatus = async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    const user = await User_1.default.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user, message: `User ${isActive ? 'activated' : 'deactivated'}` });
};
exports.updateUserStatus = updateUserStatus;
const deleteUser = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User_1.default.findByIdAndDelete(req.params.id);
    if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
};
exports.deleteUser = deleteUser;
