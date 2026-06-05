import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import User, { IUserDocument } from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search } = req.query;
  const query: FilterQuery<IUserDocument> = {};
  if (search) {
    const safe = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
    ];
  }

  const pNum = typeof page === 'string' ? parseInt(page) : (page as number);
  const lNum = typeof limit === 'string' ? parseInt(limit) : (limit as number);
  const skip = (pNum - 1) * lNum;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(lNum),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: { users, total, page: pNum, pages: Math.ceil(total / lNum) } });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user, message: 'User role updated' });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user, message: `User ${isActive ? 'activated' : 'deactivated'}` });
};

export const deleteUser = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
};
