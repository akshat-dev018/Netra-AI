import { Corridor } from '../modules/corridors/corridor.model.js';
import { Shipment } from '../modules/shipments/shipment.model.js';
import { emitMapEvent } from '../sockets/emitter.js';
import { trustedOp } from '../utils/trustedQuery.js';

/** Simulated network drift only. Never writes UserLocationPing or Driver GPS. */
export async function tickSimulationFeed(): Promise<void> {
  const corridors = await Corridor.find({ isDeleted: false });
  for (const c of corridors) {
    const drift = (Math.random() - 0.5) * 6;
    c.currentUtilization = Math.min(100, Math.max(0, c.currentUtilization + drift));
    await c.save();
    emitMapEvent('corridor:risk-updated', { corridorId: c._id, utilization: c.currentUtilization, riskScore: c.riskScore });
  }
  const shipments = await Shipment.find({
    isDeleted: false,
    status: 'in_transit',
    assignedDriverId: trustedOp({ $exists: false }),
  }).limit(20);
  for (const s of shipments) {
    emitMapEvent('shipment:position', {
      shipmentId: s._id,
      simulated: true,
      note: 'Unassigned shipment simulated position; driver GPS is device-only',
    });
  }
}
