import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, CONTROLLER_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam, paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './shipment.controller.js';

const createSchema = z.object({
  reference: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  carrier: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  cargoType: z.string().optional(),
  eta: z.coerce.date().optional(),
  currentCorridorId: z.string().optional(),
});

const patchSchema = createSchema.partial().extend({
  status: z.enum(['planned', 'in_transit', 'delayed', 'delivered', 'cancelled']).optional(),
});

const importSchema = z.object({ csv: z.string().min(1) });
const optimizeSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  cargoType: z.string().optional(),
  priority: z.string().optional(),
});

export const shipmentRouter = Router();
shipmentRouter.use(requireAuth);
shipmentRouter.get('/', roleGuard(...ANY_AUTH), validate({ query: paginationQuery }), ctrl.listShipments);
shipmentRouter.post('/', roleGuard(...CONTROLLER_WRITE), validate({ body: createSchema }), ctrl.createShipment);
shipmentRouter.post('/import', roleGuard(...CONTROLLER_WRITE), validate({ body: importSchema }), ctrl.importShipments);
shipmentRouter.get('/:id', roleGuard(...ANY_AUTH), validate({ params: idParam }), ctrl.getShipment);
shipmentRouter.patch('/:id', roleGuard(...ANY_AUTH), validate({ params: idParam, body: patchSchema }), ctrl.patchShipment);
shipmentRouter.delete('/:id', roleGuard(...CONTROLLER_WRITE), validate({ params: idParam }), ctrl.deleteShipment);

export const routeRouter = Router();
routeRouter.use(requireAuth);
routeRouter.post('/optimize', roleGuard(...CONTROLLER_WRITE), validate({ body: optimizeSchema }), ctrl.optimizeRoute);
