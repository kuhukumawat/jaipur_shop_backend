import express from 'express';
import { register, login, adminLogin, getMe, updateMe, changePassword } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.put('/me/password', verifyToken, changePassword);

export default router;
