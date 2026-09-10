import mongoose, { Schema } from 'mongoose';

export type FleetDoc = {
  name: string;
  region?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const fleetSchema = new Schema<FleetDoc>(
  {
    name: { type: String, required: true },
    region: { type: String },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

export const Fleet = mongoose.model<FleetDoc>('Fleet', fleetSchema);
