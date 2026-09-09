import mongoose, { Schema } from 'mongoose';

export type HighwayCacheDoc = {
  ref: string;
  name: string;
  geometry: { type: 'LineString'; coordinates: number[][] };
  source: string;
  syncedAt: Date;
};

const highwaySchema = new Schema<HighwayCacheDoc>({
  ref: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  geometry: {
    type: { type: String, enum: ['LineString'], required: true },
    coordinates: { type: [[Number]], required: true },
  },
  source: { type: String, default: 'osm' },
  syncedAt: { type: Date, default: Date.now },
});

highwaySchema.index({ geometry: '2dsphere' });

export const HighwayCache = mongoose.model<HighwayCacheDoc>('HighwayCache', highwaySchema);
