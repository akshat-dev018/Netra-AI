import type { Request } from 'express';
import { forbidden } from '../utils/appError.js';

export function requireFleetId(req: Request, resourceFleetId?: string): void {
  if (req.user?.role === 'admin') return;
  if (req.user?.role !== 'fleet_manager') return;
  const mine = req.user.fleetId;
  if (!mine || !resourceFleetId || mine !== resourceFleetId) {
    throw forbidden('NOT_YOUR_FLEET', 'This record is outside your fleet');
  }
}

export function fleetFilter(req: Request): Record<string, unknown> {
  if (req.user?.role === 'fleet_manager' && req.user.fleetId) {
    return { fleetId: req.user.fleetId };
  }
  return {};
}
