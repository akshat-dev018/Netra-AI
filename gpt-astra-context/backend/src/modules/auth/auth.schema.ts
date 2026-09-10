import { z } from 'zod';
import { USER_ROLES } from '../users/user.model.js';

export const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1).max(120),
  role: z.enum(USER_ROLES).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(16),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(16),
  password: passwordSchema,
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});
