import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { FLEET_WRITE, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  createAssignmentSchema,
  idParam,
  paginationQuery,
  patchAssignmentSchema,
} from '../drivers/fleet.schema.js';
import * as ctrl from './assignment.controller.js';

export const assignmentRouter = Router();
assignmentRouter.use(requireAuth);
assignmentRouter.get('/', roleGuard(...FLEET_WRITE), validate({ query: paginationQuery }), ctrl.listAssignments);
assignmentRouter.post('/', roleGuard(...FLEET_WRITE), validate({ body: createAssignmentSchema }), ctrl.createAssignment);
assignmentRouter.patch('/:id', roleGuard(...FLEET_WRITE), validate({ params: idParam, body: patchAssignmentSchema }), ctrl.patchAssignment);
