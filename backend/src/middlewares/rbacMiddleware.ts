import { Request, Response, NextFunction } from 'express';
import { permissionService } from '../services/permissionService.js';
import { AppError } from '../utils/errors.js';

export const authorize = (action: string, subject: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const hasPermission = await permissionService.checkUserPermission(userId, action, subject);

      if (!hasPermission) {
        throw new AppError(`Forbidden: You do not have permission to ${action} ${subject}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
