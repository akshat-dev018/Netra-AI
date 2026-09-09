import { z } from 'zod';
import { USER_ROLES } from './user.model.js';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(USER_ROLES),
  fleetId: z.string().optional(),
});

export const patchUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(USER_ROLES).optional(),
  fleetId: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
});

export const patchMeSchema = z.object({
  name: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
});

export const paginationQuery = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  q: z.string().optional(),
});

export const idParam = z.object({ id: z.string().min(1) });
