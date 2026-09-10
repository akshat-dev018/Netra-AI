import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, ANALYST_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import * as ctrl from './risk.controller.js';

export const riskRouter = Router();
riskRouter.use(requireAuth);
riskRouter.get('/corridors', roleGuard(...ANY_AUTH), ctrl.listCorridorRisk);
riskRouter.get('/accidents', roleGuard(...ANY_AUTH), ctrl.listAccidents);
riskRouter.post('/recompute', roleGuard(...ANALYST_WRITE), ctrl.runScore);
