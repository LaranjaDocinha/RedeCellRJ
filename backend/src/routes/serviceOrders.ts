import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createServiceOrder,
  getAllServiceOrders,
  getServiceOrderById,
  updateServiceOrder,
  changeOrderStatus,
  suggestTechnician,
  addComment,
  getComments,
  addOrderItem,
  addServiceOrderVideoAttachment,
} from '../controllers/serviceOrderController.js';
import { uploadVideo } from './uploads.js';
import { ValidationError } from '../utils/errors.js';
import taskTimeLogRouter from './taskTimeLog.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

const serviceOrderSchema = z.object({
  customer_id: z.number().optional(),
  customer_name: z.string().min(2),
  brand: z.string().min(1),
  product_description: z.string().min(3),
  imei: z.string().optional(),
  device_password: z.string().optional(),
  issue_description: z.string().min(5),
  services: z.array(z.any()).min(1),
  estimated_cost: z.number().min(0),
  down_payment: z.number().min(0).optional(),
  part_quality: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  observations: z.string().optional(),
  priority: z.string().optional(),
});

const validate =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

// Create a new service order
router.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Order'),
  validate(serviceOrderSchema),
  createServiceOrder,
);

// Get all service orders (with optional filters)
router.get(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Order'),
  getAllServiceOrders,
);

// Get a single service order by ID
router.get(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Order'),
  getServiceOrderById,
);

// Update a service order (budget, technical report)
router.put(
  '/:id',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  updateServiceOrder,
);

// Change the status of a service order
router.patch(
  '/:id/status',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  changeOrderStatus,
);

// Suggest a technician for a service order
router.get(
  '/:id/suggest-technician',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'User'),
  suggestTechnician,
);

import QRCode from 'qrcode';
// Generate a QR code for the public status page
router.get('/:id/qrcode', async (req, res) => {
  try {
    const id = req.params.id;
    const url = `http://localhost:3001/track-order/${id}`;
    const qrCodeImage = await QRCode.toDataURL(url);
    res.send(`<img src="${qrCodeImage}">`);
  } catch (err: any) {
    res.status(500).send(err.message || 'Error generating QR code');
  }
});

// Comments
router.post(
  '/:id/comments',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Order'),
  addComment,
);
router.get(
  '/:id/comments',
  authMiddleware.authenticate,
  authMiddleware.authorize('read', 'Order'),
  getComments,
);

// Add an item to a service order
router.post(
  '/:id/items',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  addOrderItem,
);

// Add video attachment to a service order
router.post(
  '/:id/attachments/video',
  authMiddleware.authenticate,
  authMiddleware.authorize('update', 'Order'),
  uploadVideo.single('video'),
  addServiceOrderVideoAttachment,
);

// Nested time log routes
router.use('/:serviceOrderId/time-log', taskTimeLogRouter);

export default router;
