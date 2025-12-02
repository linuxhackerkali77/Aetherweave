import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { aiRateLimitMiddleware } from '../middleware/rateLimiter';
import { chatWithAI, generateImage, translateText } from '../controllers/aiController';

const router = Router();

// All AI routes require authentication and rate limiting
router.use(authenticateToken);
router.use(aiRateLimitMiddleware);

// POST /api/ai/chat - Chat with AI assistant
router.post('/chat', chatWithAI);

// POST /api/ai/generate-image - Generate image from prompt
router.post('/generate-image', generateImage);

// POST /api/ai/translate - Translate text
router.post('/translate', translateText);

export default router;