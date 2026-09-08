import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Strips untrusted $-operators from filters. Wrap server-built selectors with trustedOp().
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
