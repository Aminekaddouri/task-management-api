import { Router, Request, Response } from "express";
import config from "../config";
import { version } from "os";

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// Welcome route
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Task Management API',
    version: config.apiVersion,
    endpoints: {
      health: '/api/v1/health',
    },
  });
});

export default router;