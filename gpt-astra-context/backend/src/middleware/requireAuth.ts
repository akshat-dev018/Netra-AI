import type { NextFunction, Request, Response } from 'express';
import { User } from '../modules/users/user.model.js';
import { unauthorized } from '../utils/appError.js';
import { verifyAccess } from '../utils/jwt.js';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('UNAUTHORIZED', 'No token provided');
    }
    const token = header.slice(7);
    let payload;
    try {
      payload = verifyAccess(token);
    } catch (err) {
      const name = (err as { name?: string }).name;
      if (name === 'TokenExpiredError') {
        throw unauthorized('TOKEN_EXPIRED', 'Access token expired');
      }
      throw unauthorized('TOKEN_INVALID', 'Token tampered or invalid');
    }

    const user = await User.findOne({ _id: payload.sub, isDeleted: false });
    if (!user) throw unauthorized('TOKEN_INVALID', 'Token tampered or invalid');

    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
      fleetId: user.fleetId ? String(user.fleetId) : undefined,
    };
    next();
  } catch (err) {
    next(err);
  }
}
