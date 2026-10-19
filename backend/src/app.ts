import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();
const allowedOrigins = new Set(config.cors_origins);

// Security and utility middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients such as curl and Postman.
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (config.env === 'development' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));

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
