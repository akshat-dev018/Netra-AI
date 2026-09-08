import type { Request, Response } from 'express';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { Hospital } from './hospital.model.js';

export async function listHospitals(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter = { isDeleted: false };
  const [data, total] = await Promise.all([
    Hospital.find(filter).skip(skip).limit(limit),
    Hospital.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}

export async function nearby(req: Request, res: Response) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius ?? 50000);
  const data = await Hospital.find({
    isDeleted: false,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  }).limit(20);
  res.json({ success: true, data });
}
