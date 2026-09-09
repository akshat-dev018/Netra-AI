import winston from 'winston';
import { env } from '../config/env.js';

const redact = winston.format((info) => {
  const message = String(info.message ?? '');
  const redacted = message
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/password["']?\s*[:=]\s*["']?[^"'\s]+/gi, 'password=[REDACTED]');
  info.message = redacted;
  return info;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    redact(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  ),
  transports: [new winston.transports.Console()],
});
