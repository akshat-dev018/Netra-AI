import type { Request, Response } from 'express';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { Corridor } from './corridor.model.js';

export async function listCorridors(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter = { isDeleted: false };
  const [data, total] = await Promise.all([
    Corridor.find(filter).skip(skip).limit(limit),
    Corridor.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function getCorridor(req: Request, res: Response) {
  const doc = await Corridor.findOne({ _id: req.params.id, isDeleted: false });
  res.json({ success: true, data: doc });
}
