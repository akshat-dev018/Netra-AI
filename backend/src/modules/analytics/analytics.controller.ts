import type { Request, Response } from 'express';
import { Driver } from '../drivers/driver.model.js';
import { Shipment } from '../shipments/shipment.model.js';
import { EmergencyAlert } from '../emergency-alerts/emergencyAlert.model.js';
import { Disruption } from '../disruptions/disruption.model.js';
import { Corridor } from '../corridors/corridor.model.js';
import { env } from '../../config/env.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { trustedOp } from '../../utils/trustedQuery.js';

export async function overview(_req: Request, res: Response) {
  const staleMs = env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000;
  const liveCutoff = new Date(Date.now() - staleMs);
  const [
    activeShipments,
    atRisk,
    openDisruptions,
    openAlerts,
    driversLive,
    corridors,
  ] = await Promise.all([
    Shipment.countDocuments({ isDeleted: false, status: trustedOp({ $in: ['in_transit', 'delayed'] }) }),
    Shipment.countDocuments({ isDeleted: false, riskScore: trustedOp({ $gte: 60 }) }),
    Disruption.countDocuments({ isDeleted: false, status: trustedOp({ $ne: 'resolved' }) }),
    EmergencyAlert.countDocuments({ isDeleted: false, status: trustedOp({ $ne: 'resolved' }) }),
    Driver.countDocuments({ isDeleted: false, lastPingAt: trustedOp({ $gte: liveCutoff }) }),
    Corridor.find({ isDeleted: false }).select('riskScore'),
  ]);
  const networkRiskIndex = corridors.length
    ? Math.round(corridors.reduce((s, c) => s + c.riskScore, 0) / corridors.length)
    : 0;
  res.json({
    success: true,
    data: { activeShipments, shipmentsAtRisk: atRisk, openDisruptions, openAlerts, driversLive, networkRiskIndex },
  });
}

export async function fleetCompliance(_req: Request, res: Response) {
  const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const [expiringLicenses, maintenanceDue, vehicles] = await Promise.all([
    Driver.countDocuments({ isDeleted: false, licenseExpiry: trustedOp({ $lte: soon }) }),
    Vehicle.countDocuments({ isDeleted: false, maintenanceDueAt: trustedOp({ $lte: soon }) }),
    Vehicle.countDocuments({ isDeleted: false }),
  ]);
  res.json({ success: true, data: { expiringLicenses, maintenanceDue, vehicles } });
}
