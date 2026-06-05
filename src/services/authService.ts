import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { Types } from 'mongoose';

export const generateToken = (userId: string | Types.ObjectId, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });
};

interface UserPayload {
  name?: string;
  email: string;
  password?: string;
}

export const register = async ({ name, email, password }: UserPayload) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const token = generateToken(user._id, user.role);

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
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const isMatch = await user.comparePassword(password || '');
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const token = generateToken(user._id, user.role);

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
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const isMatch = await user.comparePassword(password || '');
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  if (user.role !== 'admin') {
    throw Object.assign(new Error('Admin access only'), { statusCode: 403 });
  }

  const token = generateToken(user._id, user.role);

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
