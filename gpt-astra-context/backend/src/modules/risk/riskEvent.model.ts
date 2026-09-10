import mongoose, { Schema } from 'mongoose';

export type RiskEventDoc = {
  corridorId: mongoose.Types.ObjectId;
  score: number;
  components: Record<string, number>;
  threshold: number;
  triggeredAlertId?: mongoose.Types.ObjectId;
  createdAt: Date;
};

const riskEventSchema = new Schema<RiskEventDoc>(
  {
    corridorId: { type: Schema.Types.ObjectId, ref: 'Corridor', required: true },
    score: { type: Number, required: true },
    components: { type: Schema.Types.Mixed, default: {} },
    threshold: { type: Number, default: 70 },
    triggeredAlertId: { type: Schema.Types.ObjectId, ref: 'EmergencyAlert' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const RiskEvent = mongoose.model<RiskEventDoc>('RiskEvent', riskEventSchema);
