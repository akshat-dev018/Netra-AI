import mongoose, { Schema } from 'mongoose';

export type DataSourceDoc = {
  name: string;
  kind: 'overpass' | 'webhook' | 'manual' | 'other';
  config: Record<string, unknown>;
  lastSyncedAt?: Date;
  status: 'idle' | 'ok' | 'error';
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
};

const dsSchema = new Schema<DataSourceDoc>(
  {
    name: { type: String, required: true },
    kind: { type: String, enum: ['overpass', 'webhook', 'manual', 'other'], required: true },
    config: { type: Schema.Types.Mixed, default: {} },
    lastSyncedAt: { type: Date },
    status: { type: String, enum: ['idle', 'ok', 'error'], default: 'idle' },
    lastError: { type: String },
  },
  { timestamps: true },
);

export const DataSource = mongoose.model<DataSourceDoc>('DataSource', dsSchema);
