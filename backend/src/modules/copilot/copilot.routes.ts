import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { idParam } from '../drivers/fleet.schema.js';
import * as ctrl from './copilot.controller.js';

export const copilotRouter = Router();
copilotRouter.use(requireAuth, roleGuard(...ANY_AUTH));
copilotRouter.post(
  '/message',
  validate({ body: z.object({ content: z.string().min(1), conversationId: z.string().optional() }) }),
  ctrl.message,
);
copilotRouter.get('/conversations/:id', validate({ params: idParam }), ctrl.getConversation);
