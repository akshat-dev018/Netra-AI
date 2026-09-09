import type { Request, Response } from 'express';
import type { QueryFilter } from 'mongoose';
import { Driver, type DriverDoc } from '../drivers/driver.model.js';
import { Shipment, type ShipmentDoc } from '../shipments/shipment.model.js';
import { EmergencyAlert, type EmergencyAlertDoc } from '../emergency-alerts/emergencyAlert.model.js';
import { Disruption, type DisruptionDoc } from '../disruptions/disruption.model.js';
import { Corridor, type CorridorDoc } from '../corridors/corridor.model.js';
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
    Shipment.countDocuments({
      isDeleted: false,
      status: trustedOp({ $in: ['in_transit', 'delayed'] }),
    } satisfies QueryFilter<ShipmentDoc>),
    Shipment.countDocuments({
      isDeleted: false,
      riskScore: trustedOp({ $gte: 60 }),
    } satisfies QueryFilter<ShipmentDoc>),
    Disruption.countDocuments({
      isDeleted: false,
      status: trustedOp({ $ne: 'resolved' }),
    } satisfies QueryFilter<DisruptionDoc>),
    EmergencyAlert.countDocuments({
      isDeleted: false,
      status: trustedOp({ $ne: 'resolved' }),
    } satisfies QueryFilter<EmergencyAlertDoc>),
    Driver.countDocuments({
      isDeleted: false,
      lastPingAt: trustedOp({ $gte: liveCutoff }),
    } satisfies QueryFilter<DriverDoc>),
    Corridor.find({ isDeleted: false } satisfies QueryFilter<CorridorDoc>).select('riskScore'),
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
    Driver.countDocuments({
      isDeleted: false,
      licenseExpiry: trustedOp({ $lte: soon }),
    } satisfies QueryFilter<DriverDoc>),
    Vehicle.countDocuments({
      isDeleted: false,
      maintenanceDueAt: trustedOp({ $lte: soon }),
    }),
    Vehicle.countDocuments({ isDeleted: false }),
  ]);
  res.json({ success: true, data: { expiringLicenses, maintenanceDue, vehicles } });
}
