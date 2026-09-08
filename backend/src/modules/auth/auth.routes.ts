import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './auth.controller.js';
import {
  forgotSchema,
  idParamSchema,
  loginSchema,
  registerSchema,
  resetSchema,
  verifyEmailSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), ctrl.register);
authRouter.post('/login', validate({ body: loginSchema }), ctrl.login);
authRouter.post('/verify-email', validate({ body: verifyEmailSchema }), ctrl.verifyEmail);
authRouter.post('/forgot-password', validate({ body: forgotSchema }), ctrl.forgotPassword);
authRouter.post('/reset-password', validate({ body: resetSchema }), ctrl.resetPassword);
authRouter.post('/refresh', ctrl.refresh);
authRouter.post('/logout', requireAuth, ctrl.logout);
authRouter.get('/sessions', requireAuth, ctrl.sessions);
authRouter.delete(
  '/sessions/:id',
  requireAuth,
  validate({ params: idParamSchema }),
  ctrl.revokeSession,
);
