import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, AuthenticationError, AuthorizationError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

interface Permission {
  action: string;
  subject: string;
}

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  permissions: Permission[];
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('Decoded JWT:', decoded); // Add log
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error); // Add log
    return next(new AuthenticationError('Invalid or expired token'));
  }
};

const authorizeRoles = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AuthorizationError('You do not have permission to perform this action'));
  }
  next();
};

const authorize = (action: string, subject: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  const hasPermission = req.user.permissions.some(
    (p) => p.action === action && p.subject === subject
  );

  if (!hasPermission) {
    return next(new AuthorizationError(`You do not have permission to ${action} ${subject}`));
  }
  next();
};

export const authMiddleware = {
  authenticate,
  authorizeRoles,
  authorize,
};
