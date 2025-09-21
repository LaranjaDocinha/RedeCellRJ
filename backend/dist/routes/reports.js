var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { reportService } from '../services/reportService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { ValidationError, AppError } from '../utils/errors.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('read', 'Report')); // Only users with read:Report permission can access reports
// Zod Schemas for query parameters
const baseDateRangeSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});
const dateRangeSchema = baseDateRangeSchema.refine(data => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate', 'endDate'] });
const salesByProductSchema = baseDateRangeSchema.extend({
    productId: z.string().regex(/^\d+$/, 'Product ID must be a number string').transform(Number).optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate', 'endDate'] });
const salesByCustomerSchema = baseDateRangeSchema.extend({
    customerId: z.string().regex(/^\d+$/, 'Customer ID must be a number string').transform(Number).optional(),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate', 'endDate'] });
// Validation Middleware for query parameters
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
router.get('/sales-by-date', validate(dateRangeSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const reports = yield reportService.getSalesByDate(startDate, endDate);
        res.json(reports);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/sales-by-product', validate(salesByProductSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, productId } = req.query;
        const reports = yield reportService.getSalesByProduct(startDate, endDate, productId ? parseInt(productId, 10) : undefined);
        res.json(reports);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/sales-by-customer', validate(salesByCustomerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, customerId } = req.query;
        const reports = yield reportService.getSalesByCustomer(startDate, endDate, customerId ? parseInt(customerId, 10) : undefined);
        res.json(reports);
    }
    catch (error) {
        next(error);
    }
}));
import { stringify } from 'csv-stringify';
router.get('/:reportType/export/csv', authMiddleware.authorize('read', 'Report'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportType } = req.params;
        const { startDate, endDate, productId, customerId } = req.query;
        let reportData = [];
        switch (reportType) {
            case 'sales-by-date':
                reportData = yield reportService.getSalesByDate(startDate, endDate);
                break;
            case 'sales-by-product':
                reportData = yield reportService.getSalesByProduct(startDate, endDate, productId ? parseInt(productId, 10) : undefined);
                break;
            case 'sales-by-customer':
                reportData = yield reportService.getSalesByCustomer(startDate, endDate, customerId ? parseInt(customerId, 10) : undefined);
                break;
            default:
                throw new AppError('Invalid report type', 400);
        }
        if (reportData.length === 0) {
            return res.status(204).send(); // No content to export
        }
        // Determine columns for CSV based on report type
        let columns = [];
        if (reportType === 'sales-by-date') {
            columns = ['sale_date', 'daily_sales'];
        }
        else if (reportType === 'sales-by-product') {
            columns = ['product_name', 'color', 'total_quantity_sold', 'total_revenue'];
        }
        else if (reportType === 'sales-by-customer') {
            columns = ['customer_name', 'customer_email', 'total_spent', 'total_sales_count'];
        }
        stringify(reportData, { header: true, columns: columns }, (err, output) => {
            if (err) {
                return next(new AppError('Failed to generate CSV', 500));
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report.csv`);
            res.status(200).send(output);
        });
    }
    catch (error) {
        next(error);
    }
}));
export default router;
