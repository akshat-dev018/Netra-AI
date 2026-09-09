import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam, paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './corridor.controller.js';

export const corridorRouter = Router();
corridorRouter.use(requireAuth, roleGuard(...ANY_AUTH));
corridorRouter.get('/', validate({ query: paginationQuery }), ctrl.listCorridors);
corridorRouter.get('/:id', validate({ params: idParam }), ctrl.getCorridor);
