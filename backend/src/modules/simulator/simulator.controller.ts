import type { Request, Response } from 'express';
import { Corridor } from '../corridors/corridor.model.js';
import { SimulationScenario } from './simulationScenario.model.js';

export async function listScenarios(req: Request, res: Response) {
  const data = await SimulationScenario.find({ isDeleted: false, createdBy: req.user!.id });
  res.json({ success: true, data });
}

export async function runScenario(req: Request, res: Response) {
  const { name, inputVariables } = req.body as {
    name: string;
    inputVariables: { durationHours?: number; severityMultiplier?: number; affectedVolume?: number };
  };

  const dur = inputVariables.durationHours ?? 8;
  const sev = inputVariables.severityMultiplier ?? 1.8;
  const vol = inputVariables.affectedVolume ?? 450;

  const delayHrs = (dur * 0.75 * sev).toFixed(1);
  const cost = Math.round(vol * 4200 * sev);
  const atRisk = Math.round(vol * 0.18 * (sev / 1.5));
  const recTime = Math.round(dur * 1.8);

  const resultSummary = {
    delay: `+${delayHrs}h`,
    costDelta: `₹${cost.toLocaleString('en-IN')}`,
    atRisk,
    recoveryTime: `${recTime} Hours`,
    bypassLoad: 'Eastern Peripheral (+42%)',
  };

  const doc = await SimulationScenario.create({
    name: name || 'Custom What-If Disruption Scenario',
    createdBy: req.user!.id,
    inputVariables,
    resultSummary,
  });

  res.status(201).json({ success: true, data: doc });
}
