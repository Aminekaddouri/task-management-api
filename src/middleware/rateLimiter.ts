import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis';
import config from '../config';

// Check if Redis is connected
const isRedisConnected = () => redisClient.isOpen;

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store if connected, otherwise use memory store
  ...(isRedisConnected() && {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types don't match perfectly
      client: redisClient,
      prefix: 'rl:api:',
    }),
  }),
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(isRedisConnected() && {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types don't match perfectly
      client: redisClient,
      prefix: 'rl:auth:',
    }),
  }),
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: {
    status: 'error',
    message: 'Upload limit reached, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  ...(isRedisConnected() && {
    store: new RedisStore({
      // @ts-expect-error - RedisStore types don't match perfectly
      client: redisClient,
      prefix: 'rl:upload:',
    }),
  }),
});
