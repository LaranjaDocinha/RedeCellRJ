import { Router } from 'express';
import * as shiftReportController from '../controllers/shiftReportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';

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

import { validate } from '../middlewares/validationMiddleware.js';

// Route to get the current shift report
shiftReportsRouter.get(
  '/current',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'ShiftReport'), // Assuming 'read' permission for ShiftReport
  validate(getShiftReportSchema, 'query'),
  shiftReportController.getCurrentShiftReport,
);

export default shiftReportsRouter;
