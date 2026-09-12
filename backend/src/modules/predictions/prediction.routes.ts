import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, ANALYST_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import * as ctrl from './prediction.controller.js';

export const predictionRouter = Router();
predictionRouter.use(requireAuth);
predictionRouter.get('/', roleGuard(...ANY_AUTH), ctrl.listPredictions);
predictionRouter.post('/recompute', roleGuard(...ANALYST_WRITE), ctrl.recompute);
predictionRouter.post('/inference', roleGuard(...ANY_AUTH), ctrl.runInference);
