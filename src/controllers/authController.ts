import { Response } from 'express';
import * as authService from '../services/authService';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  const result = await authService.register({ name, email, password });
  res.status(201).json({ success: true, message: 'Registered successfully', data: result });
};

export const adminLogin = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const result = await authService.adminLogin({ email, password });
  res.json({ success: true, message: 'Admin login successful', data: result });
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const result = await authService.login({ email, password });
  res.json({ success: true, message: 'Login successful', data: result });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const { name, phone, address } = req.body;
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty' });
  }
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user, message: 'Profile updated' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new passwords required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
};
