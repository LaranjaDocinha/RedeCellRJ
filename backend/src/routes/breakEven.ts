import { Router } from 'express';
import * as breakEvenController from '../controllers/breakEvenController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/', breakEvenController.getBreakEvenPoint);

export default router;
