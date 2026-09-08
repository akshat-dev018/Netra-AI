import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { env } from '../../config/env.js';
import { AppError, forbidden, unauthorized } from '../../utils/appError.js';
import { signAccess, signRefresh, verifyRefresh } from '../../utils/jwt.js';
import { randomToken, sha256 } from '../../utils/tokenCompare.js';
import { sendMail } from '../../services/email.service.js';
import { User, type UserRole } from '../users/user.model.js';
import { Session } from './session.model.js';
import { LoginAttempt } from './loginAttempt.model.js';

const BCRYPT_COST = 12;
const GENERIC_AUTH = 'Invalid email or password';
const LOCK_MS = 15 * 60 * 1000;

export function publicUser(user: {
  _id: unknown;
  email: string;
  name: string;
  role: UserRole;
  fleetId?: unknown;
  isEmailVerified: boolean;
}) {
  return {
    _id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    fleetId: user.fleetId ? String(user.fleetId) : null,
    isEmailVerified: user.isEmailVerified,
  };
}

async function issueTokens(
  user: { _id: unknown; email: string; role: UserRole },
  meta: { userAgent?: string; ip?: string },
) {
  const sid = new Types.ObjectId().toString();
  const refresh = signRefresh({ sub: String(user._id), sid });
  const hash = await bcrypt.hash(refresh, BCRYPT_COST);
  await Session.create({
    userId: user._id as Types.ObjectId,
    tokenHash: hash,
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  const accessToken = signAccess({
    sub: String(user._id),
    role: user.role,
    email: user.email,
  });
  return { accessToken, refresh };
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  allowRoleAssign?: boolean;
}) {
  if (!env.ALLOW_PUBLIC_REGISTER && !input.allowRoleAssign) {
    throw forbidden('FORBIDDEN', 'Public registration is disabled');
  }
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'Unable to create account');
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const verifyRaw = randomToken();
  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    name: input.name,
    role: input.allowRoleAssign && input.role ? input.role : 'viewer',
    isEmailVerified: false,
    emailVerifyTokenHash: sha256(verifyRaw),
    emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  await sendMail(
    user.email,
    'Verify your NETRA account',
    `Your verification token: ${verifyRaw}`,
  );
  return publicUser(user);
}

export async function verifyEmail(token: string) {
  const hash = sha256(token);
  const user = await User.findOne({
    emailVerifyTokenHash: hash,
    emailVerifyExpires: { $gt: new Date() },
    isDeleted: false,
  }).select('+emailVerifyTokenHash +emailVerifyExpires');
  if (!user) throw new AppError(400, 'INVALID_REQUEST', 'Invalid or expired token');
  user.isEmailVerified = true;
  user.emailVerifyTokenHash = undefined;
  user.emailVerifyExpires = undefined;
  await user.save();
  return publicUser(user);
}

export async function login(
  email: string,
  password: string,
  meta: { userAgent?: string; ip?: string },
) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select(
    '+passwordHash',
  );

  if (!user) {
    await LoginAttempt.create({ email: email.toLowerCase(), ip: meta.ip, success: false });
    throw unauthorized('UNAUTHORIZED', GENERIC_AUTH);
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw unauthorized('UNAUTHORIZED', GENERIC_AUTH);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + LOCK_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    await LoginAttempt.create({ email: user.email, ip: meta.ip, success: false });
    throw unauthorized('UNAUTHORIZED', GENERIC_AUTH);
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
  await LoginAttempt.create({ email: user.email, ip: meta.ip, success: true });

  const tokens = await issueTokens(user, meta);
  return { user: publicUser(user), ...tokens };
}

export async function refresh(refreshToken: string | undefined, meta: { userAgent?: string; ip?: string }) {
  if (!refreshToken) throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token not found');
  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token not found or already rotated');
  }

  const sessions = await Session.find({
    userId: payload.sub,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  let matched: (typeof sessions)[number] | undefined;
  for (const s of sessions) {
    if (await bcrypt.compare(refreshToken, s.tokenHash)) {
      matched = s;
      break;
    }
  }

  if (!matched) {
    const any = await Session.find({ userId: payload.sub });
    for (const s of any) {
      if (await bcrypt.compare(refreshToken, s.tokenHash)) {
        await Session.updateMany({ userId: payload.sub }, { revokedAt: new Date() });
        throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token reuse detected');
      }
    }
    throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token not found or already rotated');
  }

  matched.revokedAt = new Date();
  const user = await User.findById(payload.sub);
  if (!user || user.isDeleted) throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token not found');
  const tokens = await issueTokens(user, meta);
  matched.replacedByHash = await bcrypt.hash(tokens.refresh, BCRYPT_COST);
  await matched.save();
  return { user: publicUser(user), ...tokens };
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  const sessions = await Session.find({ revokedAt: { $exists: false } });
  for (const s of sessions) {
    if (await bcrypt.compare(refreshToken, s.tokenHash)) {
      s.revokedAt = new Date();
      await s.save();
      return;
    }
  }
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (!user) return;
  const raw = randomToken();
  user.passwordResetTokenHash = sha256(raw);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendMail(user.email, 'Reset your NETRA password', `Your reset token: ${raw}`);
}

export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({
    passwordResetTokenHash: sha256(token),
    passwordResetExpires: { $gt: new Date() },
    isDeleted: false,
  }).select('+passwordResetTokenHash +passwordResetExpires +passwordHash');
  if (!user) throw new AppError(400, 'INVALID_REQUEST', 'Invalid or expired token');
  user.passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  await Session.updateMany({ userId: user._id }, { revokedAt: new Date() });
}

export async function listSessions(userId: string) {
  const sessions = await Session.find({ userId, revokedAt: { $exists: false } }).sort({
    createdAt: -1,
  });
  return sessions.map((s) => ({
    _id: String(s._id),
    userAgent: s.userAgent,
    ip: s.ip,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
  }));
}

export async function revokeSession(userId: string, sessionId: string) {
  await Session.updateOne({ _id: sessionId, userId }, { revokedAt: new Date() });
}
