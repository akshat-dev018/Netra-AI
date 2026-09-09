import mongoose, { Schema } from 'mongoose';

export type PredictionDoc = {
  corridorId: mongoose.Types.ObjectId;
  predictedRiskTrajectory: { hour: number; score: number }[];
  confidence: number;
  horizonHours: number;
  contributingSignals: string[];
  resolvedOutcome?: string;
  createdAt: Date;
  updatedAt: Date;
};

const predictionSchema = new Schema<PredictionDoc>(
  {
    corridorId: { type: Schema.Types.ObjectId, ref: 'Corridor', required: true },
    predictedRiskTrajectory: [{ hour: Number, score: Number }],
    confidence: { type: Number, default: 0.5 },
    horizonHours: { type: Number, default: 6 },
    contributingSignals: [{ type: String }],
    resolvedOutcome: { type: String },
  },
  { timestamps: true },
);

export const Prediction = mongoose.model<PredictionDoc>('Prediction', predictionSchema);
