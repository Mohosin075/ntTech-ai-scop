import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const environment = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'scopeai_local_development_secret_only';
if (
  environment === 'production' &&
  (jwtSecret.length < 32 || /development|replace-with|change-me/i.test(jwtSecret))
) {
  throw new Error('Set JWT_SECRET to a unique secret of at least 32 characters before running in production.');
}

const config = {
  env: environment,
  port: Number(process.env.PORT) || 5000,
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  cors_origins: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  database_url: process.env.DATABASE_URL || '',
  jwt: {
    secret: jwtSecret,
    expires_in: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    gemini_api_key: process.env.GEMINI_API_KEY || '',
    openai_api_key: process.env.OPENAI_API_KEY || '',
  },
};

export default config;
