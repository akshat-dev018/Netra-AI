import type { Request, Response } from 'express';
import { Driver } from '../drivers/driver.model.js';
import { Disruption } from './disruption.model.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';

export async function listDisruptions(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const [data, total] = await Promise.all([
    Disruption.find({ isDeleted: false }).sort({ startedAt: -1 }).skip(skip).limit(limit),
    Disruption.countDocuments({ isDeleted: false }),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createDisruption(req: Request, res: Response) {
  let source = req.body.source ?? 'manual';
  let reportedByDriverId;
  if (req.user?.role === 'driver') {
    source = 'driver_reported';
    const d = await Driver.findOne({ userId: req.user.id, isDeleted: false });
    reportedByDriverId = d?._id;
  }
  const doc = await Disruption.create({
    ...req.body,
    source,
    reportedByDriverId,
    startedAt: req.body.startedAt ?? new Date(),
  });
  res.status(201).json({ success: true, data: doc });
}

export async function webhookDisruption(req: Request, res: Response) {
  const key = req.get('x-api-key');
  if (!key || key !== process.env.DISRUPTION_WEBHOOK_KEY) {
    if (process.env.DISRUPTION_WEBHOOK_KEY) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
      return;
    }
  }
  const doc = await Disruption.create({ ...req.body, source: 'feed', startedAt: new Date() });
  res.status(201).json({ success: true, data: doc });
}
