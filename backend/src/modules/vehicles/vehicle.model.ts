import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type VehicleType = 'truck' | 'van' | 'rail_car' | 'other';
export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'retired';

export type VehicleDoc = {
  fleetId: mongoose.Types.ObjectId;
  registrationNumber: string;
  type: VehicleType;
  capacity?: number;
  status: VehicleStatus;
  assignedDriverId?: mongoose.Types.ObjectId;
  currentLocation?: GeoPoint;
  maintenanceDueAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const vehicleSchema = new Schema<VehicleDoc>(
  {
    fleetId: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['truck', 'van', 'rail_car', 'other'], required: true },
    capacity: { type: Number },
    status: {
      type: String,
      enum: ['active', 'idle', 'maintenance', 'retired'],
      default: 'idle',
    },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: function (this: any) {
          return this.currentLocation && this.currentLocation.coordinates && this.currentLocation.coordinates.length === 2;
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
    maintenanceDueAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

vehicleSchema.pre('save', function () {
  const loc = (this as any).currentLocation;
  if (!loc || !loc.coordinates || loc.coordinates.length !== 2) {
    (this as any).currentLocation = undefined as any;
  } else if (!loc.type) {
    loc.type = 'Point';
  }
});

vehicleSchema.index({ currentLocation: '2dsphere' }, { sparse: true });

export const Vehicle = mongoose.model<VehicleDoc>('Vehicle', vehicleSchema);
