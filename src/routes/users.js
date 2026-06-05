const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserRole, updateUserStatus, deleteUser } = require('../controllers/userController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
