import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { ANY_AUTH, roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { nearbyQuery, paginationQuery } from '../drivers/fleet.schema.js';
import * as ctrl from './hospital.controller.js';

export const hospitalRouter = Router();
hospitalRouter.use(requireAuth, roleGuard(...ANY_AUTH));
hospitalRouter.get('/', validate({ query: paginationQuery }), ctrl.listHospitals);
hospitalRouter.get('/nearby', validate({ query: nearbyQuery }), ctrl.nearby);
