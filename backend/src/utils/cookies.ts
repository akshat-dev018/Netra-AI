import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAMESITE,
    maxAge: MAX_AGE_MS,
    path: '/api/v1/auth',
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, refreshCookieOptions());
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: 0 });
}
