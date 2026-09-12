import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, DISPATCHER_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam, paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './emergencyAlert.controller.js';

const createSchema = z.object({
  type: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().optional(),
  location: z
    .object({ type: z.literal('Point'), coordinates: z.tuple([z.number(), z.number()]) })
    .optional(),
  corridorId: z.string().optional(),
  shipmentId: z.string().optional(),
});

export const emergencyRouter = Router();
emergencyRouter.use(requireAuth);
emergencyRouter.get('/alerts', roleGuard(...ANY_AUTH), validate({ query: paginationQuery }), ctrl.listAlerts);
emergencyRouter.post('/alerts', roleGuard(...DISPATCHER_WRITE, 'driver'), validate({ body: createSchema }), ctrl.createAlert);
emergencyRouter.post('/alerts/:id/acknowledge', roleGuard(...DISPATCHER_WRITE), validate({ params: idParam }), ctrl.acknowledge);
emergencyRouter.post('/alerts/:id/dispatch', roleGuard(...DISPATCHER_WRITE), validate({ params: idParam }), ctrl.dispatch);
emergencyRouter.post('/alerts/:id/approve-hospital', roleGuard(...DISPATCHER_WRITE), validate({ params: idParam }), ctrl.approveHospitalAlert);
emergencyRouter.post('/alerts/:id/reject-hospital', roleGuard(...DISPATCHER_WRITE), validate({ params: idParam }), ctrl.rejectHospitalAlert);
emergencyRouter.post('/alerts/:id/resolve', roleGuard(...DISPATCHER_WRITE), validate({ params: idParam }), ctrl.resolve);
