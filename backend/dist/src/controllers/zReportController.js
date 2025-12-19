import httpStatus from 'http-status';
import { zReportService } from '../services/zReportService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { z } from 'zod';
// Zod Schema for getZReport
export const getZReportSchema = z.object({
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional(),
});
export const generateZReport = catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    // Default to current day if dates are not provided
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999); // End of the day
    const report = await zReportService.generateZReport(start, end);
    res.status(httpStatus.OK).send(report);
});
