import type { Request, Response } from 'express';
import { AppError, notFound } from '../../utils/appError.js';
import { point } from '../../utils/geo.js';
import { emitAlert } from '../../sockets/emitter.js';
import { Driver } from '../drivers/driver.model.js';
import { Shipment } from '../shipments/shipment.model.js';
import { EmergencyAlert } from './emergencyAlert.model.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';

export async function listAlerts(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const [data, total] = await Promise.all([
    EmergencyAlert.find({ isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    EmergencyAlert.countDocuments({ isDeleted: false }),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createAlert(req: Request, res: Response) {
  let triggeredBy = req.body.triggeredBy ?? 'manual';
  let triggeredByDriverId;
  let location = req.body.location;
  let shipmentId = req.body.shipmentId;
  if (req.user?.role === 'driver') {
    triggeredBy = 'driver_sos';
    const d = await Driver.findOne({ userId: req.user.id, isDeleted: false });
    if (!d) throw notFound();
    triggeredByDriverId = d._id;
    if (d.lastKnownLocation) location = d.lastKnownLocation;
    const trip = await Shipment.findOne({ assignedDriverId: d._id, status: 'in_transit', isDeleted: false });
    shipmentId = trip?._id;
  }
  if (!location) throw new AppError(400, 'VALIDATION_ERROR', 'location required');
  const doc = await EmergencyAlert.create({
    type: req.body.type ?? 'sos',
    severity: req.body.severity ?? 'critical',
    location,
    corridorId: req.body.corridorId,
    shipmentId,
    triggeredBy,
    triggeredByDriverId,
    description: req.body.description,
  });
  emitAlert('alert:created', doc);
  res.status(201).json({ success: true, data: doc });
}

async function loadAlert(id: string) {
  const doc = await EmergencyAlert.findOne({ _id: id, isDeleted: false });
  if (!doc) throw notFound();
  return doc;
}

export async function acknowledge(req: Request, res: Response) {
  const doc = await loadAlert(String(req.params.id));
  if (doc.status !== 'open') {
    throw new AppError(400, 'ALERT_ALREADY_ACKNOWLEDGED', 'Alert already acknowledged');
  }
  doc.status = 'acknowledged';
  doc.acknowledgedBy = req.user!.id as unknown as typeof doc.acknowledgedBy;
  await doc.save();
  emitAlert('alert:acknowledged', doc);
  res.json({ success: true, data: doc });
}

export async function dispatch(req: Request, res: Response) {
  const doc = await loadAlert(String(req.params.id));
  doc.status = 'dispatched';
  if (Array.isArray(req.body.unitIds)) doc.dispatchedUnits = req.body.unitIds;
  await doc.save();
  emitAlert('alert:dispatched', doc);
  res.json({ success: true, data: doc });
}

export async function approveHospitalAlert(req: Request, res: Response) {
  const doc = await loadAlert(String(req.params.id));
  doc.status = 'dispatched';
  doc.operatorAction = {
    approvedBy: req.user?.id as any,
    approvedAt: new Date(),
    notes: req.body.notes ?? 'Operator approved AI Hospital Emergency Alert dispatch.',
  };
  await doc.save();
  emitAlert('alert:dispatched', doc);
  emitAlert('hospital:alert:dispatched', {
    alertId: doc._id,
    highwayRef: doc.aiPrediction?.highwayRef,
    hospitals: doc.aiPrediction?.nearbyHospitals ?? [],
    approvedAt: doc.operatorAction.approvedAt,
    notes: doc.operatorAction.notes,
  });
  res.json({ success: true, message: 'AI Hospital Alert approved and emergency dispatched.', data: doc });
}

export async function rejectHospitalAlert(req: Request, res: Response) {
  const doc = await loadAlert(String(req.params.id));
  doc.status = 'rejected';
  doc.operatorAction = {
    rejectedBy: req.user?.id as any,
    rejectedAt: new Date(),
    notes: req.body.reason ?? 'Operator dismissed AI recommendation after manual inspection.',
  };
  await doc.save();
  res.json({ success: true, message: 'AI Alert proposal rejected by operator.', data: doc });
}

export async function resolve(req: Request, res: Response) {
  const doc = await loadAlert(String(req.params.id));
  doc.status = 'resolved';
  doc.resolvedAt = new Date();
  await doc.save();
  emitAlert('alert:resolved', doc);
  res.json({ success: true, data: doc });
}

export { point };
