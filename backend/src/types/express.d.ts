import { Request } from 'express';

export interface UserPayload {
  id: string;
  email?: string; // Make email optional
  role: string;
  permissions?: Array<{ id: number; action: string; subject: string }>; // Make permissions optional
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
