import { Router } from 'express';
import { createTestUser } from '../controllers/testController';

const router = Router();

// GET /api/test/create-user - Create test user
router.get('/create-user', createTestUser);

export default router;