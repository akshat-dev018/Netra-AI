import mongoose from 'mongoose';

/** Mark a $-operator clause as server-authored so sanitizeFilter does not wrap it in $eq. */
export function trustedOp<T extends Record<string, unknown>>(selector: T): T {
  return mongoose.trusted(selector);
}
