import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  database_url: process.env.DATABASE_URL || '',
};

export default config;
