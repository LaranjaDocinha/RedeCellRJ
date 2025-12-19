import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { gdprService } from '../services/gdprService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

// Zod Schema for data deletion request
export const dataDeletionSchema = z.object({
  entityType: z.enum(['user', 'customer'], {
    errorMap: () => ({ message: 'Entity type must be "user" or "customer"' }),
  }),
  entityId: z.string().uuid('Invalid entity ID format'),
});

// Zod Schema for data export request
export const dataExportSchema = z.object({
  entityType: z.enum(['user', 'customer'], {
    errorMap: () => ({ message: 'Entity type must be "user" or "customer"' }),
  }),
  entityId: z.string().uuid('Invalid entity ID format'),
});



export const requestDataDeletion = catchAsync(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.body;
  const requestingUserId = req.user?.id; // Assuming req.user is populated by auth middleware

  if (!requestingUserId) {
    throw new AppError('Authentication required for this action', 401);
  }

  await gdprService.requestDataDeletion(entityType, entityId, requestingUserId);
  res.status(httpStatus.OK).send({ message: 'Data deletion request processed successfully.' });
});

export const requestDataExport = catchAsync(async (req: Request, res: Response) => {
  const { entityType, entityId } = req.body; // Using body for consistency, could be query params for GET
  const requestingUserId = req.user?.id; // Assuming req.user is populated by auth middleware

  if (!requestingUserId) {
    throw new AppError('Authentication required for this action', 401);
  }

  const data = await gdprService.requestDataExport(entityType, entityId, requestingUserId);
  res.status(httpStatus.OK).send(data);
});
