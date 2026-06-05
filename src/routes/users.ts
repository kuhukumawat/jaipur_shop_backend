import express from 'express';
import { getAllUsers, getUserById, updateUserRole, updateUserStatus, deleteUser } from '../controllers/userController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken, requireAdmin);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
