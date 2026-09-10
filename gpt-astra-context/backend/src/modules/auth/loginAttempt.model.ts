import mongoose, { Schema } from 'mongoose';

export type LoginAttemptDoc = {
  email: string;
  ip?: string;
  success: boolean;
  createdAt: Date;
};

const loginAttemptSchema = new Schema<LoginAttemptDoc>(
  {
    email: { type: String, required: true, index: true },
    ip: { type: String },
    success: { type: Boolean, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const LoginAttempt = mongoose.model<LoginAttemptDoc>('LoginAttempt', loginAttemptSchema);
