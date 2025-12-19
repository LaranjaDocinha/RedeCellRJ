import { Router } from 'express';
import { labelController } from '../controllers/labelController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post('/generate-zpl', labelController.generateZpl);

export default router;
