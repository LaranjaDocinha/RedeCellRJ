import { Router } from 'express';
import * as biIntegrationController from '../controllers/biIntegrationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.post(
  '/generate-credentials',
  authMiddleware.authorize('manage', 'BiIntegration'),
  biIntegrationController.generateCredentials,
);
router.get(
  '/reports',
  authMiddleware.authorize('view', 'BiIntegration'),
  biIntegrationController.getReports,
);
router.get(
  '/status',
  authMiddleware.authorize('view', 'BiIntegration'),
  biIntegrationController.getStatus,
);

export default router;
