import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { AppError, forbidden, notFound } from '../../utils/appError.js';
import { haversineKm, point } from '../../utils/geo.js';
import { requireFleetId } from '../../utils/scope.js';
import { writeAudit } from '../../services/audit.service.js';
import { emitTracking } from '../../sockets/emitter.js';
import { Driver } from '../drivers/driver.model.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { Shipment } from '../shipments/shipment.model.js';
import { UserLocationPing } from './userLocationPing.model.js';

export async function ping(req: Request, res: Response) {
  if (req.user?.role !== 'driver') throw forbidden();
  const driver = await Driver.findOne({ userId: req.user.id, isDeleted: false });
  if (!driver) throw notFound('Driver profile not found');

  const recordedAt = new Date(req.body.recordedAt);
  const now = Date.now();
  const skewMs = 2 * 60 * 1000;
  const staleMs = env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000;
  if (recordedAt.getTime() > now + skewMs || now - recordedAt.getTime() > staleMs) {
    throw new AppError(422, 'STALE_LOCATION', 'Location ping timestamp is implausible');
  }

  if (!driver.locationSharingEnabled || driver.status !== 'on_trip') {
    throw new AppError(400, 'LOCATION_PERMISSION_REQUIRED', 'Location sharing is off or no active trip');
  }

  const coords: [number, number] = [req.body.lng, req.body.lat];
  if (driver.lastKnownLocation?.coordinates) {
    const km = haversineKm(driver.lastKnownLocation.coordinates as [number, number], coords);
    const dtHours = Math.max(1 / 3600, (now - (driver.lastPingAt?.getTime() ?? now)) / 3_600_000);
    if (km / dtHours > 250) {
      throw new AppError(422, 'STALE_LOCATION', 'Implausible location jump');
    }
  }

  if (req.body.tripId) {
    const shipment = await Shipment.findOne({
      _id: req.body.tripId,
      assignedDriverId: driver._id,
      isDeleted: false,
    });
    if (!shipment) throw forbidden('NOT_YOUR_TRIP', 'This trip is not assigned to you');
  }

  const loc = point(req.body.lng, req.body.lat);
  const doc = await UserLocationPing.create({
    driverId: driver._id,
    fleetId: driver.fleetId,
    location: loc,
    accuracy: req.body.accuracy,
    speed: req.body.speed,
    heading: req.body.heading,
    recordedAt,
    tripId: req.body.tripId,
  });
  driver.lastKnownLocation = loc;
  driver.lastPingAt = recordedAt;
  await driver.save();
  if (driver.assignedVehicleId) {
    await Vehicle.updateOne({ _id: driver.assignedVehicleId }, { currentLocation: loc });
  }
  emitTracking('driver:location', {
    driverId: String(driver._id),
    fleetId: String(driver.fleetId),
    location: loc,
    recordedAt,
    accuracy: req.body.accuracy,
  });
  res.status(201).json({ success: true, data: { _id: doc._id, recordedAt } });
}

export async function latest(req: Request, res: Response) {
  const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });
  if (!driver) throw notFound();
  if (req.user?.role === 'fleet_manager') requireFleetId(req, String(driver.fleetId));
  if (req.user?.role === 'driver' && String(driver.userId) !== req.user.id) {
    throw forbidden('NOT_YOUR_TRIP', 'You can only read your own location');
  }
  res.json({
    success: true,
    data: {
      lastKnownLocation: driver.lastKnownLocation,
      lastPingAt: driver.lastPingAt,
      stale:
        !driver.lastPingAt ||
        Date.now() - driver.lastPingAt.getTime() >
          env.LOCATION_STALE_THRESHOLD_MINUTES * 60 * 1000,
    },
  });
}

export async function history(req: Request, res: Response) {
  const driver = await Driver.findOne({ _id: req.params.id, isDeleted: false });
  if (!driver) throw notFound();
  if (req.user?.role === 'fleet_manager') requireFleetId(req, String(driver.fleetId));
  await writeAudit(req, 'tracking.history', 'Driver', String(driver._id));
  const pings = await UserLocationPing.find({ driverId: driver._id })
    .sort({ recordedAt: -1 })
    .limit(500);
  res.json({ success: true, data: pings });
}
