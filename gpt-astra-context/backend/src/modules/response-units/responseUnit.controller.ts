import type { Request, Response } from 'express';
import { notFound } from '../../utils/appError.js';
import { ResponseUnit } from './responseUnit.model.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';

export async function listUnits(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const [data, total] = await Promise.all([
    ResponseUnit.find({ isDeleted: false }).skip(skip).limit(limit),
    ResponseUnit.countDocuments({ isDeleted: false }),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function createUnit(req: Request, res: Response) {
  const doc = await ResponseUnit.create(req.body);
  res.status(201).json({ success: true, data: doc });
}

export async function patchUnit(req: Request, res: Response) {
  const doc = await ResponseUnit.findOne({ _id: req.params.id, isDeleted: false });
  if (!doc) throw notFound();
  Object.assign(doc, req.body);
  await doc.save();
  res.json({ success: true, data: doc });
}
