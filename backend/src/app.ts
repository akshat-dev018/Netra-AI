import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from '@exortek/express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import * as Sentry from '@sentry/node';
import { env } from './config/env.js';
import { isDbReady } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((s) => s.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      name: 'NETRA — FreightIntel API Platform',
      version: '1.0.0',
      status: 'online',
      health: '/health',
      ready: '/ready',
      apiBase: '/api/v1',
      frontendUrl: env.CLIENT_URL,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });
  app.get('/ready', (_req, res) => {
    if (!isDbReady()) {
      res.status(503).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Database not ready' } });
      return;
    }
    res.json({ success: true, data: { status: 'ready' } });
  });

  app.use('/api/v1/shipments/import', express.json({ limit: '1mb' }));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());

  if (env.NODE_ENV === 'development') app.use(morgan('dev'));

  const globalLimiter = rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false });
  const authLimiter = rateLimit({ windowMs: 60_000, max: 10, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false });
  const pingLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

  app.use('/api', globalLimiter);
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1/tracking/ping', pingLimiter);

  app.use('/api/v1', apiRouter);

  if (env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
