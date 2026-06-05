"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = exports.login = exports.register = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    });
};
exports.generateToken = generateToken;
const register = async ({ name, email, password }) => {
    const existing = await User_1.default.findOne({ email });
    if (existing) {
        throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }
    const user = await User_1.default.create({ name, email, password, role: 'user' });
    const token = (0, exports.generateToken)(user._id, user.role);
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt,
        },
        token,
    };
};
exports.register = register;
const login = async ({ email, password }) => {
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const isMatch = await user.comparePassword(password || '');
    if (!isMatch) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const token = (0, exports.generateToken)(user._id, user.role);
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt,
        },
        token,
    };
};
exports.login = login;
const adminLogin = async ({ email, password }) => {
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const isMatch = await user.comparePassword(password || '');
    if (!isMatch) {
        throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    if (user.role !== 'admin') {
        throw Object.assign(new Error('Admin access only'), { statusCode: 403 });
    }
    const token = (0, exports.generateToken)(user._id, user.role);
    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt,
        },
        token,
    };
};
exports.adminLogin = adminLogin;
