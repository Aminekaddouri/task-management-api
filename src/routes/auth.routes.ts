import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes (no authentication required)

/**
 * Register new user
 * POST /api/v1/auth/register
 */
router.post(
  '/register',
  authLimiter, // Rate limit: 5 attempts per 15 minutes
  validate(registerSchema, 'body'),
  authController.register
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
router.post(
  '/login',
  authLimiter, // Rate limit: 5 attempts per 15 minutes
  validate(loginSchema, 'body'),
  authController.login
);

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', authController.refreshToken);

// Protected routes (authentication required)

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * Update user profile
 * PUT /api/v1/auth/me
 */
router.put(
  '/me',
  authenticate,
  validate(updateProfileSchema, 'body'),
  authController.updateProfile
);

/**
 * Change password
 * PUT /api/v1/auth/password
 */
router.put(
  '/password',
  authenticate,
  validate(changePasswordSchema, 'body'),
  authController.changePassword
);

export default router;
