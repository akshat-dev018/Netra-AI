import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { FLEET_WRITE, LIVE_LOCATION_READ, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam, pingSchema } from '../drivers/fleet.schema.js';
import * as ctrl from './tracking.controller.js';

export const trackingRouter = Router();
trackingRouter.use(requireAuth);
trackingRouter.post('/ping', validate({ body: pingSchema }), ctrl.ping);
trackingRouter.get(
  '/drivers/:id/latest',
  roleGuard(...LIVE_LOCATION_READ),
  validate({ params: idParam }),
  ctrl.latest,
);
trackingRouter.get(
  '/drivers/:id/history',
  roleGuard(...FLEET_WRITE),
  validate({ params: idParam }),
  ctrl.history,
);
