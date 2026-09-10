import { z } from 'zod';

export const paginationQuery = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
export const idParam = z.object({ id: z.string().min(1) });

export const createDriverSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  fleetId: z.string().optional(),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.coerce.date(),
  phone: z.string().min(5),
  emergencyContact: z.string().optional(),
});

export const patchDriverSchema = z.object({
  licenseNumber: z.string().optional(),
  licenseExpiry: z.coerce.date().optional(),
  phone: z.string().optional(),
  status: z.enum(['available', 'on_trip', 'off_duty']).optional(),
  assignedVehicleId: z.string().nullable().optional(),
  emergencyContact: z.string().optional(),
  locationSharingEnabled: z.boolean().optional(),
});

export const createVehicleSchema = z.object({
  fleetId: z.string().optional(),
  registrationNumber: z.string().min(1),
  type: z.enum(['truck', 'van', 'rail_car', 'other']),
  capacity: z.number().optional(),
  status: z.enum(['active', 'idle', 'maintenance', 'retired']).optional(),
  maintenanceDueAt: z.coerce.date().optional(),
});

export const patchVehicleSchema = createVehicleSchema.partial();

export const createAssignmentSchema = z.object({
  driverId: z.string(),
  vehicleId: z.string(),
  shipmentId: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
});

export const patchAssignmentSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
  endsAt: z.coerce.date().optional(),
});

export const pingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  recordedAt: z.coerce.date(),
  tripId: z.string().optional(),
});

export const nearbyQuery = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().optional(),
});
