import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getUserProfile, updateUserProfile, getUserStats } from '../controllers/userController';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/profile - Get current user's profile
router.get('/profile', getUserProfile);

// PUT /api/users/profile - Update current user's profile
router.put('/profile', updateUserProfile);

// GET /api/users/stats - Get current user's statistics
router.get('/stats', getUserStats);

export default router;