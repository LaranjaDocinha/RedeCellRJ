import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as soController from '../controllers/serviceOrderController.js';
import { uploadVideo } from './uploads.js'; // Importar o uploadsRouter para usar o middleware de upload
import { ValidationError } from '../utils/errors.js';
import taskTimeLogRouter from './taskTimeLog.js';

const router = Router();

const serviceOrderSchema = z.object({
  customer_id: z.string(),
  product_description: z.string(),
  imei: z.string().optional(),
  entry_checklist: z.object({}).passthrough(), // a more specific schema can be defined
  issue_description: z.string(),
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
router.post('/', validate(serviceOrderSchema), soController.createServiceOrder);

// Get all service orders (with optional filters)
router.get('/', soController.getAllServiceOrders);

// Get a single service order by ID
router.get('/:id', soController.getServiceOrderById);

// Update a service order (budget, technical report)
router.put('/:id', soController.updateServiceOrder);

// Change the status of a service order
router.patch('/:id/status', soController.changeOrderStatus);

// Suggest a technician for a service order
router.get('/:id/suggest-technician', soController.suggestTechnician);

import QRCode from 'qrcode';
// Generate a QR code for the public status page
router.get('/:id/qrcode', async (req, res) => {
  try {
    const id = req.params.id;
    // This URL should point to your frontend's public tracking page
    const url = `http://localhost:3001/track-order/${id}`;
    const qrCodeImage = await QRCode.toDataURL(url);
    res.send(`<img src="${qrCodeImage}">`);
  } catch (err: any) {
    res.status(500).send(err.message || 'Error generating QR code');
  }
});

// Comments
router.post('/:id/comments', soController.addComment);
router.get('/:id/comments', soController.getComments);

// Add an item to a service order
router.post('/:id/items', soController.addOrderItem);

// Add video attachment to a service order
router.post(
  '/:id/attachments/video',
  uploadVideo.single('video'), // Usar o middleware de upload de vídeo
  soController.addServiceOrderVideoAttachment,
);

// We can add routes to update/delete items later if needed
// router.put('/:id/items/:itemId', soController.updateOrderItem);
// router.delete('/:id/items/:itemId', soController.deleteOrderItem);

// Nested time log routes
router.use('/:serviceOrderId/time-log', taskTimeLogRouter);

export default router;
