import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { clearRefreshCookie, setRefreshCookie } from '../../utils/cookies.js';

function meta(req: Request) {
  return { userAgent: req.get('user-agent') ?? undefined, ip: req.ip };
}

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body.email, req.body.password, meta(req));
  setRefreshCookie(res, result.refresh);
  res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
}

export async function verifyEmail(req: Request, res: Response) {
  const user = await authService.verifyEmail(req.body.token);
  res.json({ success: true, data: user });
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  res.json({ success: true, data: { message: 'If the account exists, an email was sent' } });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: { message: 'Password updated' } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken as string | undefined;
  const result = await authService.refresh(token, meta(req));
  setRefreshCookie(res, result.refresh);
  res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.refreshToken as string | undefined);
  clearRefreshCookie(res);
  res.json({ success: true, data: { message: 'Logged out' } });
}

export async function sessions(req: Request, res: Response) {
  const data = await authService.listSessions(req.user!.id);
  res.json({ success: true, data });
}

export async function revokeSession(req: Request, res: Response) {
  await authService.revokeSession(req.user!.id, String(req.params.id));
  res.json({ success: true, data: { message: 'Session revoked' } });
}
