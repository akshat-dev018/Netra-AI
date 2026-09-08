import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, roleGuard } from '../../middleware/roleGuard.js';
import * as ctrl from './highway.controller.js';

export const highwayRouter = Router();
highwayRouter.use(requireAuth);
highwayRouter.get('/', roleGuard(...ANY_AUTH), ctrl.listHighways);
highwayRouter.post('/sync', roleGuard('admin'), ctrl.sync);
