import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/services', authMiddleware.authenticate, healthController.getServicesHealth);

export default router;
