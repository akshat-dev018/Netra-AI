import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANALYST_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './simulator.controller.js';

const runSchema = z.object({
  name: z.string(),
  inputVariables: z.record(z.string(), z.unknown()),
});

export const simulatorRouter = Router();
simulatorRouter.use(requireAuth, roleGuard(...ANALYST_WRITE));
simulatorRouter.get('/scenarios', ctrl.listScenarios);
simulatorRouter.post('/run', validate({ body: runSchema }), ctrl.runScenario);
