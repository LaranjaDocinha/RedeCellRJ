import { Router, Request, Response, NextFunction } from 'express';
import * as shiftReportController from '../controllers/shiftReportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';

const shiftReportsRouter = Router();

// Zod Schema for branchId validation (if needed, for query params or body)
const getShiftReportSchema = z.object({
  branchId: z
    .preprocess(
      (val) => parseInt(String(val), 10),
      z.number().int().positive('Branch ID must be a positive integer'),
    )
    .optional(), // Optional for now, will use user's branch if not provided
});



// Route to get the current shift report
// TODO: A função do controller 'getCurrentShiftReport' não foi encontrada. Rota comentada.
// shiftReportsRouter.get(
//   '/current',
//   authMiddleware.authenticate,
//   authMiddleware.authorize('read', 'ShiftReport'), // Assuming 'read' permission for ShiftReport
//   validate(getShiftReportSchema),
//   getCurrentShiftReport,
// );

export default shiftReportsRouter;
