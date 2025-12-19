import { Router } from 'express';
import { getMaintenanceMode, setMaintenanceMode } from '../controllers/maintenanceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/maintenance', getMaintenanceMode);
router.post(
  '/maintenance',
  authMiddleware.authenticate,
  authMiddleware.authorize('manage', 'Maintenance'),
  setMaintenanceMode,
);

export default router;
