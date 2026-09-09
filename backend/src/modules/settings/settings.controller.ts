import type { Request, Response } from 'express';
import { DataSource } from './dataSource.model.js';
import { notFound } from '../../utils/appError.js';

export async function listSources(_req: Request, res: Response) {
  const data = await DataSource.find();
  res.json({ success: true, data });
}

export async function upsertSource(req: Request, res: Response) {
  const doc = await DataSource.findOneAndUpdate(
    { name: req.body.name },
    req.body,
    { upsert: true, new: true },
  );
  res.status(201).json({ success: true, data: doc });
}

export async function getSource(req: Request, res: Response) {
  const doc = await DataSource.findById(req.params.id);
  if (!doc) throw notFound();
  res.json({ success: true, data: doc });
}
