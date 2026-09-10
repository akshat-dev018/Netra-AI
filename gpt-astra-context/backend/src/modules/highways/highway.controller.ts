import type { Request, Response } from 'express';
import { HighwayCache } from './highwayCache.model.js';
import { syncHighways } from '../../services/highwayData.service.js';

export async function listHighways(_req: Request, res: Response) {
  const data = await HighwayCache.find();
  res.json({ success: true, data });
}

export async function sync(_req: Request, res: Response) {
  const result = await syncHighways();
  res.json({ success: true, data: result });
}
