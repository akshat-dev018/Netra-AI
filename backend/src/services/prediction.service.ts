import { Corridor } from '../modules/corridors/corridor.model.js';
import { Prediction } from '../modules/predictions/prediction.model.js';
import { emitRiskEvent } from '../sockets/emitter.js';

export async function refreshPredictions(): Promise<void> {
  const corridors = await Corridor.find({ isDeleted: false });
  for (const c of corridors) {
    const base = c.riskScore;
    const trajectory = Array.from({ length: 7 }, (_, hour) => ({
      hour,
      score: Math.round(Math.min(100, Math.max(0, base + (hour - 3) * 4))),
    }));
    const doc = await Prediction.findOneAndUpdate(
      { corridorId: c._id },
      {
        corridorId: c._id,
        predictedRiskTrajectory: trajectory,
        confidence: 0.62,
        horizonHours: 6,
        contributingSignals: ['utilization', 'open_disruptions', 'historical_density'],
      },
      { upsert: true, returnDocument: 'after' as const },
    );
    emitRiskEvent('prediction:updated', doc);
  }
}
