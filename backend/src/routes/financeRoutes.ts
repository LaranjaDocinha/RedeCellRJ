import { Router } from 'express';
import multer from 'multer';
import { financeController } from '../controllers/financeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const upload = multer({ dest: 'uploads/temp/' });
const router = Router();

router.post(
  '/reconcile/ofx',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'Finance'),
  upload.single('ofx'),
  financeController.uploadOfx,
);

export default router;
