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

const CITY_COORDS: Record<string, [number, number]> = {
  'delhi': [28.6139, 77.2090],
  'tughlakabad': [28.5355, 77.2678],
  'agra': [27.1767, 78.0081],
  'gurugram': [28.4595, 77.0266],
  'jaipur': [26.9124, 75.7873],
  'noida': [28.5355, 77.3910],
  'mathura': [27.4924, 77.6737],
  'mumbai': [19.0760, 72.8777],
  'kolkata': [22.5726, 88.3639],
  'chennai': [13.0827, 80.2707],
  'bengaluru': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
};

function getCityCoords(name: string, fallback: [number, number]): [number, number] {
  const lower = name.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return fallback;
}

export async function optimizeRoute(req: Request, res: Response) {
  const { origin, destination, cargoType, priority } = req.body as {
    origin: string;
    destination: string;
    cargoType?: string;
    priority?: string;
  };

  const start = getCityCoords(origin || '', [28.6139, 77.2090]);
  const end = getCityCoords(destination || '', [27.1767, 78.0081]);

  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distanceKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 111);

  const candidates = [
    {
      rank: 1,
      title: 'AI incident-avoidance corridor',
      origin: origin || 'Origin Node',
      destination: destination || 'Destination Node',
      etaMinutes: Math.round((distanceKm / 65) * 60),
      distanceKm,
      costIndex: 82,
      riskScore: 38,
      breakdown: { weather: 10, congestion: 14, accidentDensity: 14 },
      coords: [
        start,
        [start[0] + dx * 0.25 + 0.05, start[1] + dy * 0.25 - 0.04],
        [start[0] + dx * 0.5 - 0.03, start[1] + dy * 0.5 + 0.06],
        [start[0] + dx * 0.75 + 0.04, start[1] + dy * 0.75 - 0.02],
        end,
      ],
    },
    {
      rank: 2,
      title: 'Alternate arterial (higher delay)',
      origin: origin || 'Origin Node',
      destination: destination || 'Destination Node',
      etaMinutes: Math.round((distanceKm / 52) * 60),
      distanceKm: Math.round(distanceKm * 1.15),
      costIndex: 98,
      riskScore: 54,
      breakdown: { weather: 18, congestion: 24, accidentDensity: 12 },
      coords: [
        start,
        [start[0] + dx * 0.3 - 0.12, start[1] + dy * 0.3 + 0.15],
        [start[0] + dx * 0.6 + 0.1, start[1] + dy * 0.6 - 0.12],
        end,
      ],
    },
    {
      rank: 3,
      title: 'Direct urban artery (elevated risk)',
      origin: origin || 'Origin Node',
      destination: destination || 'Destination Node',
      etaMinutes: Math.round((distanceKm / 44) * 60),
      distanceKm: Math.round(distanceKm * 1.05),
      costIndex: 112,
      riskScore: 76,
      breakdown: { weather: 25, congestion: 35, accidentDensity: 28 },
      coords: [
        start,
        [start[0] + dx * 0.5 + 0.18, start[1] + dy * 0.5 + 0.22],
        end,
      ],
    },
  ];

  res.json({ success: true, data: candidates });
}

