import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Strips untrusted $-operators from filters. Wrap server-built selectors with trustedOp().
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

let memoryServer: any = null;

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('MongoDB connected to ' + env.MONGODB_URI);
    return;
  } catch (initialErr) {
    if (env.NODE_ENV !== 'production') {
      try {
        logger.warn('Direct MongoDB connection failed. Starting embedded MongoDB server for seamless development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'netra',
          },
        });
        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        logger.info('Embedded MongoDB connected at ' + uri);
        return;
      } catch (memErr) {
        logger.error('Embedded MongoDB failed to start', { memErr });
      }
    }
  }

  const maxAttempts = 3;
  const retryDelayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
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
  if (memoryServer) {
    await memoryServer.stop();
  }
  logger.info('MongoDB disconnected');
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
