import type { Request, Response } from 'express';
import { refreshPredictions } from '../../services/prediction.service.js';
import { Prediction } from './prediction.model.js';

export async function listPredictions(_req: Request, res: Response) {
  const data = await Prediction.find().sort({ updatedAt: -1 });
  res.json({ success: true, data });
}

export async function recompute(_req: Request, res: Response) {
  await refreshPredictions();
  const data = await Prediction.find();
  res.json({ success: true, data });
}
