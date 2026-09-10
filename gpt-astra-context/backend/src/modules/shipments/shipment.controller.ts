import type { Request, Response } from 'express';
import { forbidden, notFound } from '../../utils/appError.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { Driver } from '../drivers/driver.model.js';
import { Shipment } from './shipment.model.js';

async function ownDriver(req: Request) {
  return Driver.findOne({ userId: req.user!.id, isDeleted: false });
}

export async function listShipments(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter: Record<string, unknown> = { isDeleted: false };
  if (req.user?.role === 'driver') {
    const d = await ownDriver(req);
    filter.assignedDriverId = d?._id;
  }
  const [data, total] = await Promise.all([
    Shipment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Shipment.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createShipment(req: Request, res: Response) {
  const shipment = await Shipment.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, data: shipment });
}

export async function getShipment(req: Request, res: Response) {
  const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });
  if (!shipment) throw notFound();
  if (req.user?.role === 'driver') {
    const d = await ownDriver(req);
    if (!d || String(shipment.assignedDriverId) !== String(d._id)) {
      throw forbidden('NOT_YOUR_TRIP', 'This trip is not assigned to you');
    }
  }
  res.json({ success: true, data: shipment });
}

export async function patchShipment(req: Request, res: Response) {
  const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });
  if (!shipment) throw notFound();
  if (req.user?.role === 'driver') {
    const d = await ownDriver(req);
    if (!d || String(shipment.assignedDriverId) !== String(d._id)) {
      throw forbidden('NOT_YOUR_TRIP', 'This trip is not assigned to you');
    }
    if (req.body.status) shipment.status = req.body.status;
    if (req.body.status === 'in_transit') {
      d.status = 'on_trip';
      d.locationSharingEnabled = true;
      await d.save();
    }
    if (req.body.status === 'delivered') {
      d.status = 'available';
      d.locationSharingEnabled = false;
      await d.save();
    }
    await shipment.save();
    res.json({ success: true, data: shipment });
    return;
  }
  Object.assign(shipment, req.body);
  await shipment.save();
  res.json({ success: true, data: shipment });
}

export async function deleteShipment(req: Request, res: Response) {
  const shipment = await Shipment.findOne({ _id: req.params.id, isDeleted: false });
  if (!shipment) throw notFound();
  shipment.isDeleted = true;
  shipment.deletedAt = new Date();
  await shipment.save();
  res.json({ success: true, data: { message: 'Deleted' } });
}

export async function importShipments(req: Request, res: Response) {
  const csv = String(req.body.csv ?? '');
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const [header, ...rows] = lines;
  if (!header) {
    res.json({ success: true, data: { imported: 0 } });
    return;
  }
  const cols = header.split(',').map((c) => c.trim());
  let imported = 0;
  for (const row of rows) {
    const vals = row.split(',').map((v) => v.trim());
    const rec: Record<string, string> = {};
    cols.forEach((c, i) => {
      rec[c] = vals[i] ?? '';
    });
    if (!rec.reference) continue;
    await Shipment.updateOne(
      { reference: rec.reference },
      {
        $setOnInsert: {
          reference: rec.reference,
          origin: rec.origin || 'Unknown',
          destination: rec.destination || 'Unknown',
          carrier: rec.carrier,
          createdBy: req.user!.id,
        },
      },
      { upsert: true },
    );
    imported += 1;
  }
  res.json({ success: true, data: { imported } });
}

export async function optimizeRoute(req: Request, res: Response) {
  const { origin, destination } = req.body as { origin: string; destination: string };
  const candidates = [0.8, 1, 1.2].map((mult, i) => ({
    rank: i + 1,
    origin,
    destination,
    etaMinutes: Math.round(180 * mult),
    distanceKm: Math.round(250 * mult),
    costIndex: Math.round(100 * mult),
    riskScore: Math.round(40 + i * 12),
    breakdown: { weather: 10 + i * 4, congestion: 15 + i * 3, accidentDensity: 15 + i * 5 },
  }));
  res.json({ success: true, data: candidates });
}
