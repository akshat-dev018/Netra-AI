import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type EmergencyAlertDoc = {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'dispatched' | 'resolved';
  location: GeoPoint;
  corridorId?: mongoose.Types.ObjectId;
  shipmentId?: mongoose.Types.ObjectId;
  triggeredBy: 'system' | 'manual' | 'driver_sos';
  triggeredByDriverId?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  dispatchedUnits: mongoose.Types.ObjectId[];
  resolvedAt?: Date;
  slaMinutes: number;
  description?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const alertSchema = new Schema<EmergencyAlertDoc>(
  {
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'critical' },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'dispatched', 'resolved'],
      default: 'open',
    },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    corridorId: { type: Schema.Types.ObjectId, ref: 'Corridor' },
    shipmentId: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    triggeredBy: { type: String, enum: ['system', 'manual', 'driver_sos'], required: true },
    triggeredByDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    dispatchedUnits: [{ type: Schema.Types.ObjectId, ref: 'ResponseUnit' }],
    resolvedAt: { type: Date },
    slaMinutes: { type: Number, default: 30 },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

alertSchema.index({ location: '2dsphere' });

export const EmergencyAlert = mongoose.model<EmergencyAlertDoc>('EmergencyAlert', alertSchema);
