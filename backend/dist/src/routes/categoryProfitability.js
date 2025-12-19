import { Router } from 'express';
import * as categoryProfitabilityController from '../controllers/categoryProfitabilityController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.get('/', categoryProfitabilityController.getCategoryProfitability);
export default router;
