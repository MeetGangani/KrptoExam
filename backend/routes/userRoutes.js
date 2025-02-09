import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect, adminOnly, instituteOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Example of role-based routes (you can add more as needed)
router.get('/admin-only', protect, adminOnly, (req, res) => {
  res.json({ message: 'Admin access granted' });
});

router.get('/institute-only', protect, instituteOnly, (req, res) => {
  res.json({ message: 'Institute access granted' });
});

export default router;
