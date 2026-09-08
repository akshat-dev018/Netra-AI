import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { DISPATCHER_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam, paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './responseUnit.controller.js';

const createSchema = z.object({
  name: z.string(),
  type: z.string(),
  status: z.enum(['available', 'en_route', 'on_scene', 'unavailable']).optional(),
});

export const responseUnitRouter = Router();
responseUnitRouter.use(requireAuth, roleGuard(...DISPATCHER_WRITE));
responseUnitRouter.get('/', validate({ query: paginationQuery }), ctrl.listUnits);
responseUnitRouter.post('/', validate({ body: createSchema }), ctrl.createUnit);
responseUnitRouter.patch('/:id', validate({ params: idParam, body: createSchema.partial() }), ctrl.patchUnit);
