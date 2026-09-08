import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type DisruptionDoc = {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedCorridorIds: mongoose.Types.ObjectId[];
  status: 'open' | 'monitoring' | 'resolved';
  source: 'manual' | 'feed' | 'driver_reported';
  reportedByDriverId?: mongoose.Types.ObjectId;
  location?: GeoPoint;
  startedAt: Date;
  resolvedAt?: Date;
  description: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const disruptionSchema = new Schema<DisruptionDoc>(
  {
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    affectedCorridorIds: [{ type: Schema.Types.ObjectId, ref: 'Corridor' }],
    status: { type: String, enum: ['open', 'monitoring', 'resolved'], default: 'open' },
    source: { type: String, enum: ['manual', 'feed', 'driver_reported'], default: 'manual' },
    reportedByDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    startedAt: { type: Date, required: true },
    resolvedAt: { type: Date },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

export const Disruption = mongoose.model<DisruptionDoc>('Disruption', disruptionSchema);
