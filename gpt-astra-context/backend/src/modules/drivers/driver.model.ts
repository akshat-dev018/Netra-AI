import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type DriverStatus = 'available' | 'on_trip' | 'off_duty';

export type DriverDoc = {
  userId: mongoose.Types.ObjectId;
  fleetId: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseExpiry: Date;
  phone: string;
  assignedVehicleId?: mongoose.Types.ObjectId;
  status: DriverStatus;
  emergencyContact?: string;
  lastKnownLocation?: GeoPoint;
  lastPingAt?: Date;
  locationSharingEnabled: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const driverSchema = new Schema<DriverDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fleetId: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true, index: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    phone: { type: String, required: true },
    assignedVehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    status: { type: String, enum: ['available', 'on_trip', 'off_duty'], default: 'available' },
    emergencyContact: { type: String },
    lastKnownLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    lastPingAt: { type: Date },
    locationSharingEnabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

driverSchema.index({ lastKnownLocation: '2dsphere' });
driverSchema.index({ fleetId: 1, isDeleted: 1 });

export const Driver = mongoose.model<DriverDoc>('Driver', driverSchema);
