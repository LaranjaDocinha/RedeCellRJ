import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/:invoiceId/generate-pdf',
  authMiddleware.authorize('manage', 'Invoices'),
  invoiceController.generatePdf,
);
router.get(
  '/:invoiceId/download-link',
  authMiddleware.authorize('view', 'Invoices'),
  invoiceController.getDownloadLink,
);

export default router;
