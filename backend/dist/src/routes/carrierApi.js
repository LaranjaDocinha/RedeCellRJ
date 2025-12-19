import { Router } from 'express';
import * as carrierApiController from '../controllers/carrierApiController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.post('/activate-chip', authMiddleware.authorize('manage', 'CarrierApi'), carrierApiController.activateChip);
router.post('/activate-plan', authMiddleware.authorize('manage', 'CarrierApi'), carrierApiController.activatePlan);
router.get('/status', authMiddleware.authorize('view', 'CarrierApi'), carrierApiController.getStatus);
export default router;
