import type { Request } from 'express';
import { AuditLog } from '../modules/audit-log/auditLog.model.js';

export async function writeAudit(
  req: Request | { user?: { id: string }; ip?: string },
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await AuditLog.create({
    actorId: req.user?.id,
    action,
    targetType,
    targetId,
    metadata,
    ip: 'ip' in req ? req.ip : undefined,
  });
}
