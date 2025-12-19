import httpStatus from 'http-status';
import * as salesHistoryService from '../services/salesHistoryService.js';
import { catchAsync } from '../utils/catchAsync.js';
export const getSalesHistoryController = catchAsync(async (req, res) => {
    const { startDate, endDate, customerId, userId, page, limit } = req.query;
    const result = await salesHistoryService.getSalesHistory({
        startDate: startDate,
        endDate: endDate,
        customerId: customerId,
        userId: userId,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.status(httpStatus.OK).send(result);
});
export const getSaleDetailsController = catchAsync(async (req, res) => {
    const { saleId } = req.params;
    const saleDetails = await salesHistoryService.getSaleDetails(saleId);
    res.status(httpStatus.OK).send(saleDetails);
});
