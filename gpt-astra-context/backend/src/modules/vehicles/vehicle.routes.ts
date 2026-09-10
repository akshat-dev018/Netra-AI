import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { FLEET_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  createVehicleSchema,
  idParam,
  paginationQuery,
  patchVehicleSchema,
} from '../drivers/fleet.schema.js';
import * as ctrl from './vehicle.controller.js';

export const vehicleRouter = Router();
vehicleRouter.use(requireAuth);
vehicleRouter.get('/', roleGuard(...FLEET_WRITE), validate({ query: paginationQuery }), ctrl.listVehicles);
vehicleRouter.post('/', roleGuard(...FLEET_WRITE), validate({ body: createVehicleSchema }), ctrl.createVehicle);
vehicleRouter.get('/:id', roleGuard(...FLEET_WRITE), validate({ params: idParam }), ctrl.getVehicle);
vehicleRouter.patch('/:id', roleGuard(...FLEET_WRITE), validate({ params: idParam, body: patchVehicleSchema }), ctrl.patchVehicle);
