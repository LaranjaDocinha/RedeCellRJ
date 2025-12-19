import { Router, Request, Response, NextFunction } from 'express';
import * as zReportController from '../controllers/zReportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

const zReportsRouter = Router();

// Zod Schema for Z-Report generation request
const getZReportSchema = z.object({
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
});




import { validate } from '../middlewares/validationMiddleware.js';

// Route to generate a Z-Report
zReportsRouter.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'ZReport'), // Assuming 'read' permission for ZReport
  validate(getZReportSchema, 'query'),
  zReportController.generateZReport,
);

export default zReportsRouter;
