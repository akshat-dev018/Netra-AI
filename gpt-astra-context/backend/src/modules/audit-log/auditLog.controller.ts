import type { Request, Response } from 'express';
import { AuditLog } from './auditLog.model.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';

export async function listAudit(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter: Record<string, unknown> = {};
  if (req.query.action) filter.action = req.query.action;
  const [data, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta(total, page, limit) });
}
