import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { Driver } from '../drivers/driver.model.js';
import { Session } from '../auth/session.model.js';
import { User } from './user.model.js';
import { publicUser } from '../auth/auth.service.js';
import { paginationMeta, parsePagination } from '../../utils/pagination.js';
import { AppError, notFound } from '../../utils/appError.js';
import { writeAudit } from '../../services/audit.service.js';

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw notFound();
  res.json({ success: true, data: publicUser(user) });
}

export async function patchMe(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user) throw notFound();
  if (req.body.name) user.name = req.body.name;
  if (req.body.password) user.passwordHash = await bcrypt.hash(req.body.password, 12);
  await user.save();
  res.json({ success: true, data: publicUser(user) });
}

export async function exportMe(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw notFound();
  const sessions = await Session.find({ userId: user._id }).select('userAgent ip createdAt expiresAt');
  const driver = await Driver.findOne({ userId: user._id, isDeleted: false }).lean();
  const driverExport = driver
    ? {
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        phone: driver.phone,
        status: driver.status,
        locationHistory: 'redacted',
      }
    : null;
  await writeAudit(req, 'users.export', 'User', String(user._id));
  res.json({
    success: true,
    data: {
      user: publicUser(user),
      sessions,
      driver: driverExport,
      exportedAt: new Date().toISOString(),
    },
  });
}

export async function list(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(Number(req.query.page), Number(req.query.limit));
  const filter: Record<string, unknown> = { isDeleted: false };
  if (req.query.q) {
    filter.$or = [
      { email: { $regex: req.query.q, $options: 'i' } },
      { name: { $regex: req.query.q, $options: 'i' } },
    ];
  }
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: data.map(publicUser),
    pagination: paginationMeta(total, page, limit),
  });
}

export async function create(req: Request, res: Response) {
  const exists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (exists) throw new AppError(409, 'CONFLICT', 'Unable to create account');
  const user = await User.create({
    email: req.body.email.toLowerCase(),
    passwordHash: await bcrypt.hash(req.body.password, 12),
    name: req.body.name,
    role: req.body.role,
    fleetId: req.body.fleetId,
    isEmailVerified: true,
  });
  await writeAudit(req, 'users.create', 'User', String(user._id), { role: user.role });
  res.status(201).json({ success: true, data: publicUser(user) });
}

export async function getById(req: Request, res: Response) {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user) throw notFound();
  res.json({ success: true, data: publicUser(user) });
}

export async function patch(req: Request, res: Response) {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('+passwordHash');
  if (!user) throw notFound();
  if (req.body.name) user.name = req.body.name;
  if (req.body.role) user.role = req.body.role;
  if (req.body.fleetId !== undefined) user.fleetId = req.body.fleetId ?? undefined;
  if (req.body.password) user.passwordHash = await bcrypt.hash(req.body.password, 12);
  await user.save();
  res.json({ success: true, data: publicUser(user) });
}

export async function remove(req: Request, res: Response) {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false });
  if (!user) throw notFound();
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  await Session.updateMany({ userId: user._id }, { revokedAt: new Date() });
  await writeAudit(req, 'users.delete', 'User', String(user._id));
  res.json({ success: true, data: { message: 'Deleted' } });
}
