import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  database_url: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'scopeai_super_secret_jwt_key_2026',
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    gemini_api_key: process.env.GEMINI_API_KEY || '',
    openai_api_key: process.env.OPENAI_API_KEY || '',
  },
};

export default config;
