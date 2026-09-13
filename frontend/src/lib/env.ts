import { z } from 'zod';

export const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:5001'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_MAP_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ENABLE_REAL_TIME: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_ENABLE_COPILOT: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_LOCATION_PING_INTERVAL_SECONDS: z.string().optional(),
});

const parsed = envSchema.safeParse({
  ...process.env,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
});
if (!parsed.success) {
  throw new Error(`Invalid frontend environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
}

export const env = parsed.data;
