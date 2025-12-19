import httpStatus from 'http-status';
import { salesGoalService } from '../services/salesGoalService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
// Zod Schema for branchId validation (if needed, for query params or body)
export const getSalesGoalSchema = z.object({
    branchId: z
        .preprocess((val) => parseInt(String(val), 10), z.number().int().positive('Branch ID must be a positive integer'))
        .optional(), // Optional for now, will use user's branch if not provided
});
export const getCurrentDailySalesGoal = catchAsync(async (req, res) => {
    // In a real application, branchId would come from the authenticated user's context
    // For now, we'll use a default or a query parameter
    const branchId = req.query.branchId ? parseInt(req.query.branchId, 10) : 1; // Default to branch 1
    const goal = await salesGoalService.getCurrentDailySalesGoal(branchId);
    res.status(httpStatus.OK).send(goal);
});
