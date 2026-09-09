import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import * as ctrl from './auditLog.controller.js';

export const auditRouter = Router();
auditRouter.use(requireAuth, roleGuard('admin'));
auditRouter.get('/', ctrl.listAudit);
