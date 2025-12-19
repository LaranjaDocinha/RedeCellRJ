import { Router } from 'express';
import * as partnerApiController from '../controllers/partnerApiController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Routes for managing API keys (protected by admin auth)
router.post(
  '/keys',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'PartnerApiKeys'),
  partnerApiController.createApiKey,
);
router.put(
  '/keys/:id/revoke',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'PartnerApiKeys'),
  partnerApiController.revokeApiKey,
);
router.get(
  '/keys',
  authMiddleware.authenticate,
  authMiddleware.authorize('view', 'PartnerApiKeys'),
  partnerApiController.getApiKeys,
);

// Public API routes (protected by partner API key auth)
router.get(
  '/public/data',
  partnerApiController.partnerAuthMiddleware,
  partnerApiController.getPublicData,
);

export default router;
