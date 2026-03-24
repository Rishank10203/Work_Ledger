import express from 'express';
import { authUser, registerUser, getUserProfile, getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, authorize('admin', 'user', 'client'), getUsers);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);

router.route('/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router;
