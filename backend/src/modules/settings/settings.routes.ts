import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './settings.controller.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth, roleGuard('admin'));
settingsRouter.get('/data-sources', ctrl.listSources);
settingsRouter.post(
  '/data-sources',
  validate({
    body: z.object({
      name: z.string(),
      kind: z.enum(['overpass', 'webhook', 'manual', 'other']),
      config: z.record(z.string(), z.unknown()).optional(),
    }),
  }),
  ctrl.upsertSource,
);
