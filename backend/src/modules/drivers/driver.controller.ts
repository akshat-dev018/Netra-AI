import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { AppError, notFound } from '../../utils/appError.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { fleetFilter, requireFleetId } from '../../utils/scope.js';
import { User } from '../users/user.model.js';
import { Driver } from './driver.model.js';

function resolveFleetId(req: Request, bodyFleetId?: string) {
  if (req.user?.role === 'fleet_manager') {
    if (!req.user.fleetId) throw new AppError(400, 'INVALID_REQUEST', 'User has no fleet');
    return req.user.fleetId;
  }
  if (!bodyFleetId) throw new AppError(400, 'VALIDATION_ERROR', 'fleetId is required');
  return bodyFleetId;
}

export async function listDrivers(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter = { isDeleted: false, ...fleetFilter(req) };
  const [data, total] = await Promise.all([
    Driver.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Driver.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createDriver(req: Request, res: Response) {
  const fleetId = resolveFleetId(req, req.body.fleetId);
  const exists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (exists) throw new AppError(409, 'CONFLICT', 'Unable to create account');
  const user = await User.create({
    email: req.body.email.toLowerCase(),
    passwordHash: await bcrypt.hash(req.body.password, 12),
    name: req.body.name,
    role: 'driver',
    fleetId,
    isEmailVerified: true,
  });
  const driver = await Driver.create({
    userId: user._id,
    fleetId,
    licenseNumber: req.body.licenseNumber,
    licenseExpiry: req.body.licenseExpiry,
    phone: req.body.phone,
    emergencyContact: req.body.emergencyContact,
  });
  res.status(201).json({ success: true, data: driver });
}

export async function getDriver(req: Request, res: Response) {
  const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });
  if (!driver) throw notFound();
  requireFleetId(req, String(driver.fleetId));
  res.json({ success: true, data: driver });
}

export async function patchDriver(req: Request, res: Response) {
  const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });
  if (!driver) throw notFound();
  requireFleetId(req, String(driver.fleetId));
  Object.assign(driver, req.body);
  await driver.save();
  res.json({ success: true, data: driver });
}
