import mongoose, { Schema } from 'mongoose';

export const USER_ROLES = [
  'admin',
  'ops_manager',
  'controller',
  'analyst',
  'dispatcher',
  'fleet_manager',
  'driver',
  'viewer',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserDoc = {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  fleetId?: mongoose.Types.ObjectId;
  isEmailVerified: boolean;
  emailVerifyTokenHash?: string;
  emailVerifyExpires?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    fleetId: { type: Schema.Types.ObjectId, ref: 'Fleet' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyTokenHash: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isDeleted: 1, role: 1 });

export const User = mongoose.model<UserDoc>('User', userSchema);
