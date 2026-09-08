import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { FLEET_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './driver.controller.js';
import { createDriverSchema, idParam, paginationQuery, patchDriverSchema } from './fleet.schema.js';

export const driverRouter = Router();
driverRouter.use(requireAuth);
driverRouter.get('/', roleGuard(...FLEET_WRITE), validate({ query: paginationQuery }), ctrl.listDrivers);
driverRouter.post('/', roleGuard(...FLEET_WRITE), validate({ body: createDriverSchema }), ctrl.createDriver);
driverRouter.get('/:id', roleGuard(...FLEET_WRITE), validate({ params: idParam }), ctrl.getDriver);
driverRouter.patch('/:id', roleGuard(...FLEET_WRITE), validate({ params: idParam, body: patchDriverSchema }), ctrl.patchDriver);
