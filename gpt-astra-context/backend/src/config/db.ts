import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Strips untrusted $-operators from filters. Wrap server-built selectors with trustedOp().
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export async function connectDb(): Promise<void> {
  const maxAttempts = 5;
  const retryDelayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      logger.info('MongoDB connected');
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      logger.warn('MongoDB connection attempt failed; retrying', {
        attempt,
        nextAttemptInMs: retryDelayMs,
        error,
      });
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
