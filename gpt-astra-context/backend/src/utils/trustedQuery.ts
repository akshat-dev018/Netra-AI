import mongoose from 'mongoose';

/** Mark a $-operator clause as server-authored so sanitizeFilter does not wrap it in $eq. */
export function trustedOp<const T extends Record<string, unknown>>(selector: T): T {
  return mongoose.trusted(selector);
}
