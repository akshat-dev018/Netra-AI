import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type UserLocationPingDoc = {
  driverId: mongoose.Types.ObjectId;
  fleetId: mongoose.Types.ObjectId;
  location: GeoPoint;
  accuracy?: number;
  speed?: number;
  heading?: number;
  recordedAt: Date;
  tripId?: mongoose.Types.ObjectId;
  createdAt: Date;
};

const pingSchema = new Schema<UserLocationPingDoc>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    fleetId: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    accuracy: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    recordedAt: { type: Date, required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pingSchema.index({ location: '2dsphere' });
pingSchema.index({ recordedAt: 1 });

export const UserLocationPing = mongoose.model<UserLocationPingDoc>(
  'UserLocationPing',
  pingSchema,
);
