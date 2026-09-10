import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './user.controller.js';
import { createUserSchema, idParam, paginationQuery, patchMeSchema, patchUserSchema } from './user.schema.js';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', ctrl.me);
userRouter.patch('/me', validate({ body: patchMeSchema }), ctrl.patchMe);
userRouter.get('/me/export', ctrl.exportMe);
userRouter.get('/', roleGuard('admin'), validate({ query: paginationQuery }), ctrl.list);
userRouter.post('/', roleGuard('admin'), validate({ body: createUserSchema }), ctrl.create);
userRouter.get('/:id', roleGuard('admin'), validate({ params: idParam }), ctrl.getById);
userRouter.patch('/:id', roleGuard('admin'), validate({ params: idParam, body: patchUserSchema }), ctrl.patch);
userRouter.delete('/:id', roleGuard('admin'), validate({ params: idParam }), ctrl.remove);
