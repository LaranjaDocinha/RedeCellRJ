import { Router } from 'express';
import { whatIfController } from '../controllers/whatIfController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/simulate', authMiddleware.authenticate, whatIfController.runSimulation);

export default router;
