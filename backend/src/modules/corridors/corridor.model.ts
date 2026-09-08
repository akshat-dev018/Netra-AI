import mongoose, { Schema } from 'mongoose';

export type CorridorDoc = {
  name: string;
  highwayRef: string;
  path: { type: 'LineString'; coordinates: number[][] };
  nodeStart: string;
  nodeEnd: string;
  type: string;
  capacity: number;
  currentUtilization: number;
  riskScore: number;
  riskComponents: Record<string, number>;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const corridorSchema = new Schema<CorridorDoc>(
  {
    name: { type: String, required: true },
    highwayRef: { type: String, required: true },
    path: {
      type: { type: String, enum: ['LineString'], required: true },
      coordinates: { type: [[Number]], required: true },
    },
    nodeStart: { type: String, required: true },
    nodeEnd: { type: String, required: true },
    type: { type: String, default: 'national' },
    capacity: { type: Number, default: 100 },
    currentUtilization: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
    riskComponents: { type: Schema.Types.Mixed, default: {} },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

corridorSchema.index({ path: '2dsphere' });
corridorSchema.index({ name: 'text', highwayRef: 'text' });

export const Corridor = mongoose.model<CorridorDoc>('Corridor', corridorSchema);
