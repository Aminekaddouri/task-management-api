import { Router, Request, Response } from 'express';
import config from '../config';
import prisma from '../config/database';
import redisClient from '../config/redis';
import testRoutes from './test.routes';
import authRoutes from './auth.routes';

const router = Router();

// Health check route
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';

    res.status(200).json({
      status: 'success',
      message: 'Server is running!',
      timestamp: new Date().toISOString(),
      environment: config.env,
      services: {
        database: 'connected',
        redis: redisStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Service health check failed',
      services: {
        database: 'error',
        redis: redisClient.isOpen ? 'connected' : 'disconnected',
      },
    });
  }
});

// Welcome route
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Task Management API',
    version: config.apiVersion,
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      test: '/api/v1/test',
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/test', testRoutes);

export default router;
