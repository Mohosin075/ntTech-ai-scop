import { Server } from 'http';
import app from './app';
import config from './config';
import prisma from './config/prisma';

let server: Server;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL database connected successfully via Prisma');

    server = app.listen(config.port, () => {
      console.log(`🚀 Modular Backend running at http://localhost:${config.port}`);
      console.log(`🩺 Health check available at http://localhost:${config.port}/health`);
      console.log(`📦 API v1 Base: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

const exitHandler = () => {
  if (server) {
    server.close(async () => {
      console.log('Server closed gracefully');
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error('Unexpected Error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  exitHandler();
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  exitHandler();
});

bootstrap();
