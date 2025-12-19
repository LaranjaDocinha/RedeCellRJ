import { Router } from 'express';
import * as shiftController from '../controllers/shiftController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// For now, only admins or managers can manage shifts
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Shifts')); // This assumes a 'Shifts' subject in permissions

router.post('/', shiftController.createShift);
router.get('/', shiftController.getShifts);
router.put('/:id', shiftController.updateShift);
router.delete('/:id', shiftController.deleteShift);

export default router;
