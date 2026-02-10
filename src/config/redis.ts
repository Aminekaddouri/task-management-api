import { createClient } from 'redis';
import logger from '../utils/logger';
import config from './index';

// Create Redis client
const redisClient = createClient({
  url: config.redis.url,
});

// Event handlers
redisClient.on('error', err => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis Client Reconnecting');
});

redisClient.on('end', () => {
  logger.warn('Redis Client Disconnected');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('✅ Successfully connected to Redis');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    // Don't exit process - Redis is optional for basic functionality
    logger.warn('⚠️  Running without Redis. Caching and rate limiting will use memory.');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Disconnecting Redis Client...');
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;