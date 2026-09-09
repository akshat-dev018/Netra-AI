import type { Request, Response } from 'express';
import { AppError, notFound } from '../../utils/appError.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { fleetFilter, requireFleetId } from '../../utils/scope.js';
import { Vehicle } from './vehicle.model.js';

function resolveFleetId(req: Request, bodyFleetId?: string) {
  if (req.user?.role === 'fleet_manager') {
    if (!req.user.fleetId) throw new AppError(400, 'INVALID_REQUEST', 'User has no fleet');
    return req.user.fleetId;
  }
  if (!bodyFleetId) throw new AppError(400, 'VALIDATION_ERROR', 'fleetId is required');
  return bodyFleetId;
}

export async function listVehicles(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter = { isDeleted: false, ...fleetFilter(req) };
  const [data, total] = await Promise.all([
    Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Vehicle.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createVehicle(req: Request, res: Response) {
  const fleetId = resolveFleetId(req, req.body.fleetId);
  const exists = await Vehicle.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
  if (exists) throw new AppError(409, 'CONFLICT', 'Registration already exists');
  const vehicle = await Vehicle.create({ ...req.body, fleetId, registrationNumber: req.body.registrationNumber.toUpperCase() });
  res.status(201).json({ success: true, data: vehicle });
}

export async function getVehicle(req: Request, res: Response) {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });
  if (!vehicle) throw notFound();
  requireFleetId(req, String(vehicle.fleetId));
  res.json({ success: true, data: vehicle });
}

export async function patchVehicle(req: Request, res: Response) {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, isDeleted: false });
  if (!vehicle) throw notFound();
  requireFleetId(req, String(vehicle.fleetId));
  Object.assign(vehicle, req.body);
  if (req.body.status === 'retired') {
    vehicle.isDeleted = true;
    vehicle.deletedAt = new Date();
  }
  await vehicle.save();
  res.json({ success: true, data: vehicle });
}
