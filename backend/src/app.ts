import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();
const allowedOrigins = new Set(config.cors_origins.map((origin) => origin.replace(/\/+$/, '')));

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients such as curl and Postman.
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.has(normalizedOrigin) || allowedOrigins.has('*')) {
        return callback(null, true);
      }

      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|92\.205\.234\.176)(:\d+)?$/.test(
          normalizedOrigin
        )
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

// Root Base Route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ScopeAI Backend API Server',
    environment: config.env,
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiV1: '/api/v1',
    },
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Modular Application API routes (v1)
app.use('/api/v1', router);

// 404 Route Not Found handler
app.use(notFound);

// Centralized Global Error Handler
app.use(globalErrorHandler);

export default app;
