import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { OPS_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam } from '../drivers/fleet.schema.js';
import * as ctrl from './report.controller.js';

const createSchema = z.object({
  type: z.string(),
  format: z.enum(['csv', 'pdf']).optional(),
  dateRange: z.object({ from: z.coerce.date(), to: z.coerce.date() }).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export const reportRouter = Router();
reportRouter.use(requireAuth, roleGuard(...OPS_WRITE));
reportRouter.get('/', ctrl.listReports);
reportRouter.post('/', validate({ body: createSchema }), ctrl.createReport);
reportRouter.get('/:id/export', validate({ params: idParam }), ctrl.exportReport);
