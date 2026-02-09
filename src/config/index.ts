import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  apiVersion: string;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
}

export default config