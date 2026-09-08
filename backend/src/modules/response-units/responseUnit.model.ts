import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type ResponseUnitDoc = {
  name: string;
  type: string;
  status: 'available' | 'en_route' | 'on_scene' | 'unavailable';
  currentLocation?: GeoPoint;
  assignedAlertId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const unitSchema = new Schema<ResponseUnitDoc>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'en_route', 'on_scene', 'unavailable'],
      default: 'available',
    },
    currentLocation: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    assignedAlertId: { type: Schema.Types.ObjectId, ref: 'EmergencyAlert' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

export const ResponseUnit = mongoose.model<ResponseUnitDoc>('ResponseUnit', unitSchema);
