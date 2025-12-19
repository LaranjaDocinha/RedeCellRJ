import { Router } from 'express';
import * as timeClockController from '../controllers/timeClockController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

// Employee routes
router.post('/clock-in', timeClockController.clockIn);
router.post('/clock-out', timeClockController.clockOut);
router.get('/me', timeClockController.getMyEntries);
router.get('/me/latest', timeClockController.getMyLatestEntry);

// Manager/Admin routes
router.get('/users/:userId', timeClockController.getUserEntries);
router.get('/branches/:branchId', timeClockController.getBranchEntries);

export default router;
