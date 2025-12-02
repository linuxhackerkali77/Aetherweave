import { Router } from 'express';
import userRoutes from './userRoutes';
import aiRoutes from './aiRoutes';
import testRoutes from './testRoutes';
import uploadRoutes from './upload';
import callRoutes from './calls';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);
router.use('/test', testRoutes);
router.use('/upload', uploadRoutes);
router.use('/calls', callRoutes);

export default router;