import mongoose, { Schema } from 'mongoose';
import type { GeoPoint } from '../../utils/geo.js';

export type HospitalDoc = {
  name: string;
  location: GeoPoint;
  traumaLevel: number;
  capabilities: string[];
  capacityStatus: 'available' | 'limited' | 'full';
  contactInfo: { phone?: string; address?: string };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const hospitalSchema = new Schema<HospitalDoc>(
  {
    name: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    traumaLevel: { type: Number, min: 1, max: 4, default: 3 },
    capabilities: [{ type: String }],
    capacityStatus: {
      type: String,
      enum: ['available', 'limited', 'full'],
      default: 'available',
    },
    contactInfo: {
      phone: String,
      address: String,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ name: 'text' });

export const Hospital = mongoose.model<HospitalDoc>('Hospital', hospitalSchema);
