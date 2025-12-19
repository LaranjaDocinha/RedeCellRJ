import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ipWhitelistMiddleware } from '../middlewares/ipWhitelistMiddleware.js'; // Added import

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Settings')); // Requires admin/manager settings permission
router.use(ipWhitelistMiddleware); // Apply IP whitelist middleware to marketplace routes

router.get('/integrations', marketplaceController.getIntegrations);
router.post('/integrations', marketplaceController.saveIntegration);
router.patch('/integrations/:id/toggle', marketplaceController.toggleIntegration);

export default router;
