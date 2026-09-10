import type { Request, Response } from 'express';
import { accidentRiskSummary, scoreCorridors } from '../../services/riskScoring.service.js';
import { Corridor } from '../corridors/corridor.model.js';
import { RiskEvent } from './riskEvent.model.js';

export async function listCorridorRisk(_req: Request, res: Response) {
  const data = await Corridor.find({ isDeleted: false }).select(
    'name highwayRef riskScore riskComponents currentUtilization',
  );
  res.json({ success: true, data });
}

export async function listAccidents(_req: Request, res: Response) {
  const data = await accidentRiskSummary();
  res.json({ success: true, data });
}

export async function runScore(_req: Request, res: Response) {
  await scoreCorridors();
  const recent = await RiskEvent.find().sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: recent });
}
