import type { UserRole } from '../modules/users/user.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email: string;
        fleetId?: string;
      };
      cookies?: Record<string, string>;
    }
  }
}

export {};
