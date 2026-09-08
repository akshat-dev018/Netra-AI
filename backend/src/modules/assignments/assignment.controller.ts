import type { Request, Response } from 'express';
import { AppError, notFound } from '../../utils/appError.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { fleetFilter, requireFleetId } from '../../utils/scope.js';
import { Driver } from '../drivers/driver.model.js';
import { Shipment } from '../shipments/shipment.model.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { Assignment } from './assignment.model.js';
import { trustedOp } from '../../utils/trustedQuery.js';

export async function listAssignments(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter = { isDeleted: false, ...fleetFilter(req) };
  const [data, total] = await Promise.all([
    Assignment.find(filter).sort({ startsAt: -1 }).skip(skip).limit(limit),
    Assignment.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createAssignment(req: Request, res: Response) {
  const driver = await Driver.findOne({ _id: req.body.driverId, isDeleted: false });
  const vehicle = await Vehicle.findOne({ _id: req.body.vehicleId, isDeleted: false });
  const shipment = await Shipment.findOne({ _id: req.body.shipmentId, isDeleted: false });
  if (!driver || !vehicle || !shipment) throw notFound();
  requireFleetId(req, String(driver.fleetId));
  if (String(driver.fleetId) !== String(vehicle.fleetId)) {
    throw new AppError(400, 'INVALID_REQUEST', 'Driver and vehicle must share a fleet');
  }
  const conflict = await Assignment.findOne({
    isDeleted: false,
    status: trustedOp({ $in: ['scheduled', 'active'] }),
    $or: [{ driverId: driver._id }, { vehicleId: vehicle._id }],
  });
  if (conflict) throw new AppError(409, 'CONFLICT', 'Driver or vehicle already assigned');

  const assignment = await Assignment.create({
    fleetId: driver.fleetId,
    driverId: driver._id,
    vehicleId: vehicle._id,
    shipmentId: shipment._id,
    startsAt: req.body.startsAt,
    endsAt: req.body.endsAt,
    status: 'scheduled',
  });
  shipment.assignedDriverId = driver._id;
  shipment.assignedVehicleId = vehicle._id;
  await shipment.save();
  driver.assignedVehicleId = vehicle._id;
  vehicle.assignedDriverId = driver._id;
  await driver.save();
  await vehicle.save();
  res.status(201).json({ success: true, data: assignment });
}

export async function patchAssignment(req: Request, res: Response) {
  const assignment = await Assignment.findOne({ _id: req.params.id, isDeleted: false });
  if (!assignment) throw notFound();
  requireFleetId(req, String(assignment.fleetId));
  Object.assign(assignment, req.body);
  await assignment.save();
  res.json({ success: true, data: assignment });
}
