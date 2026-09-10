import mongoose, { Schema } from 'mongoose';

export type SimulationScenarioDoc = {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  inputVariables: Record<string, unknown>;
  resultSummary?: Record<string, unknown>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const scenarioSchema = new Schema<SimulationScenarioDoc>(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inputVariables: { type: Schema.Types.Mixed, required: true },
    resultSummary: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const SimulationScenario = mongoose.model<SimulationScenarioDoc>(
  'SimulationScenario',
  scenarioSchema,
);
