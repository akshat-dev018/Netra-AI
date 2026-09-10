import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, CONTROLLER_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './disruption.controller.js';

const createSchema = z.object({
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  affectedCorridorIds: z.array(z.string()).optional(),
  location: z
    .object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) })
    .optional(),
  startedAt: z.coerce.date().optional(),
});

export const disruptionRouter = Router();
disruptionRouter.use(requireAuth);
disruptionRouter.get('/', roleGuard(...ANY_AUTH), validate({ query: paginationQuery }), ctrl.listDisruptions);
disruptionRouter.post('/', roleGuard(...CONTROLLER_WRITE, 'driver'), validate({ body: createSchema }), ctrl.createDisruption);
