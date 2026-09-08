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
    inputVariables: { corridorId?: string; utilizationDelta?: number; weatherIndex?: number };
  };
  const corridor = inputVariables.corridorId
    ? await Corridor.findById(inputVariables.corridorId)
    : await Corridor.findOne({ isDeleted: false });
  const base = corridor?.riskScore ?? 40;
  const projected = Math.min(
    100,
    base + (inputVariables.utilizationDelta ?? 0) * 0.4 + (inputVariables.weatherIndex ?? 0) * 0.3,
  );
  const resultSummary = {
    baselineRisk: base,
    projectedRisk: Math.round(projected),
    corridorId: corridor?._id,
  };
  const doc = await SimulationScenario.create({
    name,
    createdBy: req.user!.id,
    inputVariables,
    resultSummary,
  });
  res.status(201).json({ success: true, data: doc });
}
