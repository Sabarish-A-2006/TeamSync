const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.patch('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
