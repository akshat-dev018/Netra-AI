import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { OPS_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import * as ctrl from './analytics.controller.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth, roleGuard(...OPS_WRITE));
analyticsRouter.get('/overview', ctrl.overview);
analyticsRouter.get('/fleet-compliance', ctrl.fleetCompliance);
