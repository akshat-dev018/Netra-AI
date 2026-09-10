import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserRole } from '../modules/users/user.model.js';

export type AccessPayload = {
  sub: string;
  role: UserRole;
  email: string;
  typ: 'access';
};

export type RefreshPayload = {
  sub: string;
  sid: string;
  typ: 'refresh';
};

export function signAccess(payload: Omit<AccessPayload, 'typ'>): string {
  return jwt.sign({ ...payload, typ: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefresh(payload: Omit<RefreshPayload, 'typ'>): string {
  return jwt.sign({ ...payload, typ: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccess(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  if (decoded.typ !== 'access') throw new Error('invalid');
  return decoded;
}

export function verifyRefresh(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
  if (decoded.typ !== 'refresh') throw new Error('invalid');
  return decoded;
}
