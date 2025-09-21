import { Router, Request, Response, NextFunction } from 'express';
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
const validate = (schema: z.ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

router.get('/sales-by-date',
  validate(dateRangeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      const reports = await reportService.getSalesByDate(startDate as string, endDate as string);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/sales-by-product',
  validate(salesByProductSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, productId } = req.query;
      const reports = await reportService.getSalesByProduct(startDate as string, endDate as string, productId ? parseInt(productId as string, 10) : undefined);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/sales-by-customer',
  validate(salesByCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, customerId } = req.query;
      const reports = await reportService.getSalesByCustomer(startDate as string, endDate as string, customerId ? parseInt(customerId as string, 10) : undefined);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
);

import { stringify } from 'csv-stringify';

router.get(
  '/:reportType/export/csv',
  authMiddleware.authorize('read', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportType } = req.params;
      const { startDate, endDate, productId, customerId } = req.query;

      let reportData: any[] = [];
      switch (reportType) {
        case 'sales-by-date':
          reportData = await reportService.getSalesByDate(startDate as string, endDate as string);
          break;
        case 'sales-by-product':
          reportData = await reportService.getSalesByProduct(startDate as string, endDate as string, productId ? parseInt(productId as string, 10) : undefined);
          break;
        case 'sales-by-customer':
          reportData = await reportService.getSalesByCustomer(startDate as string, endDate as string, customerId ? parseInt(customerId as string, 10) : undefined);
          break;
        default:
          throw new AppError('Invalid report type', 400);
      }

      if (reportData.length === 0) {
        return res.status(204).send(); // No content to export
      }

      // Determine columns for CSV based on report type
      let columns: string[] = [];
      if (reportType === 'sales-by-date') {
        columns = ['sale_date', 'daily_sales'];
      } else if (reportType === 'sales-by-product') {
        columns = ['product_name', 'color', 'total_quantity_sold', 'total_revenue'];
      } else if (reportType === 'sales-by-customer') {
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

    } catch (error) {
      next(error);
    }
  }
);

export default router;
