import express from 'express';
import { register, login, adminLogin, getMe, updateMe, changePassword } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/admin/login', adminLogin as any);
router.get('/me', verifyToken as any, getMe as any);
router.put('/me', verifyToken as any, updateMe as any);
router.put('/me/password', verifyToken as any, changePassword as any);

export default router;
