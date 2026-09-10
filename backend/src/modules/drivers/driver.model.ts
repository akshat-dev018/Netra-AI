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
      type: {
        type: String,
        enum: ['Point'],
        required: function (this: any) {
          return this.lastKnownLocation && this.lastKnownLocation.coordinates && this.lastKnownLocation.coordinates.length === 2;
        },
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (v: number[]) {
            return v === undefined || (Array.isArray(v) && v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90);
          },
          message: 'Coordinates must be [lng, lat] in valid ranges',
        },
      },
    },
    lastPingAt: { type: Date },
    locationSharingEnabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

driverSchema.pre('save', function () {
  const loc = (this as any).lastKnownLocation;
  if (!loc || !loc.coordinates || loc.coordinates.length !== 2) {
    (this as any).lastKnownLocation = undefined as any;
  } else if (!loc.type) {
    loc.type = 'Point';
  }
});

driverSchema.index({ lastKnownLocation: '2dsphere' }, { sparse: true });
driverSchema.index({ fleetId: 1, isDeleted: 1 });

export const Driver = mongoose.model<DriverDoc>('Driver', driverSchema);
