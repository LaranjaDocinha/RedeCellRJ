import { Router } from 'express';
import * as whatIfController from '../controllers/whatIfController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post('/promotion', whatIfController.simulatePromotion);

export default router;
