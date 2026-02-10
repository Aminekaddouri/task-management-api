import app from './app';
import config from './config';
import logger from './utils/logger';
import { connectRedis } from './config/redis';

// Initialize Redis connection
connectRedis().catch(err => {
  logger.error('Redis initialization failed:', err);
});

// Start server
app.listen(config.port, () => {
  logger.info(`🚀 Server is running on http://localhost:${config.port}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`📍 API Base: http://localhost:${config.port}/api/${config.apiVersion}`);
});
