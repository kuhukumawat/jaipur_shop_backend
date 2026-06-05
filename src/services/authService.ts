import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Types } from 'mongoose';

export const generateToken = (userId: string | Types.ObjectId, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

interface UserPayload {
  name: string;
  email: string;
  password?: string;
}

export const register = async ({ name, email, password }: UserPayload) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already in use') as any;
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const token = generateToken(user._id as string, user.role);

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

export const login = async ({ email, password }: UserPayload) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password') as any;
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password || '');
  if (!isMatch) {
    const error = new Error('Invalid email or password') as any;
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id as string, user.role);

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

export const adminLogin = async ({ email, password }: UserPayload) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password') as any;
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password || '');
  if (!isMatch) {
    const error = new Error('Invalid email or password') as any;
    error.statusCode = 401;
    throw error;
  }

  if (user.role !== 'admin') {
    const error = new Error('Admin access only') as any;
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id as string, user.role);

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
