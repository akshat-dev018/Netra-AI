import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../modules/users/user.model.js';
import { forbidden } from '../utils/appError.js';

export function roleGuard(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(forbidden());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden('ROLE_SCOPE_DENIED', 'Insufficient permissions'));
      return;
    }
    next();
  };
}

export const ANY_AUTH: UserRole[] = [
  'admin',
  'ops_manager',
  'controller',
  'analyst',
  'dispatcher',
  'fleet_manager',
  'driver',
  'viewer',
];

export const COMMAND_READ: UserRole[] = [
  'admin',
  'ops_manager',
  'controller',
  'analyst',
  'dispatcher',
  'viewer',
];

export const CONTROLLER_WRITE: UserRole[] = ['admin', 'ops_manager', 'controller'];
export const DISPATCHER_WRITE: UserRole[] = ['admin', 'dispatcher', 'ops_manager'];
export const ANALYST_WRITE: UserRole[] = ['admin', 'analyst'];
export const OPS_WRITE: UserRole[] = ['admin', 'ops_manager'];
export const FLEET_WRITE: UserRole[] = ['admin', 'fleet_manager'];
export const LIVE_LOCATION_READ: UserRole[] = [
  'admin',
  'ops_manager',
  'controller',
  'dispatcher',
  'fleet_manager',
];
