import { Corridor } from '../modules/corridors/corridor.model.js';
import { Disruption } from '../modules/disruptions/disruption.model.js';
import { Shipment } from '../modules/shipments/shipment.model.js';
import { RiskEvent } from '../modules/risk/riskEvent.model.js';
import { emitRiskEvent } from '../sockets/emitter.js';
import { trustedOp } from '../utils/trustedQuery.js';

export async function scoreCorridors(): Promise<void> {
  const corridors = await Corridor.find({ isDeleted: false });
  for (const c of corridors) {
    const disruptions = await Disruption.countDocuments({
      isDeleted: false,
      status: trustedOp({ $ne: 'resolved' }),
      affectedCorridorIds: c._id,
    });
    const shipments = await Shipment.countDocuments({
      isDeleted: false,
      status: 'in_transit',
      currentCorridorId: c._id,
    });
    const weather = Math.min(40, c.currentUtilization * 0.3);
    const congestion = Math.min(40, (shipments / Math.max(1, c.capacity)) * 40);
    const incidents = Math.min(30, disruptions * 12);
    const accidentDensity = Math.min(20, (c.riskComponents?.accidentDensity as number) ?? 8);
    const score = Math.round(Math.min(100, weather + congestion + incidents + accidentDensity));
    c.riskScore = score;
    c.riskComponents = { weather, congestion, incidents, accidentDensity };
    await c.save();
    await RiskEvent.create({ corridorId: c._id, score, components: c.riskComponents, threshold: 70 });
    emitRiskEvent('risk:updated', { corridorId: c._id, score, components: c.riskComponents });
  }
}

export async function accidentRiskSummary() {
  const corridors = await Corridor.find({ isDeleted: false }).select('name highwayRef riskScore riskComponents');
  return corridors.map((c) => ({
    corridorId: c._id,
    name: c.name,
    highwayRef: c.highwayRef,
    accidentProbability: Math.min(1, c.riskScore / 100),
    components: c.riskComponents,
  }));
}
