import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().url(),
  CORS_ORIGINS: z.string().min(1),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  ALLOW_PUBLIC_REGISTER: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  ENCRYPTION_KEY: z.string().length(64),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  MAPBOX_SERVER_TOKEN: z.string().optional(),
  OVERPASS_API_URL: z.string().optional(),
  LOCATION_PING_MAX_INTERVAL_SECONDS: z.coerce.number().default(60),
  LOCATION_STALE_THRESHOLD_MINUTES: z.coerce.number().default(5),
  LOCATION_RAW_RETENTION_HOURS: z.coerce.number().default(72),
  ANTHROPIC_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET) {
  console.error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
