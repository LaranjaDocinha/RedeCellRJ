import { Router } from 'express';
import * as taskTimeLogController from '../controllers/taskTimeLogController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
// This router will be merged into the service orders router
const router = Router({ mergeParams: true });
router.use(authMiddleware.authenticate);
router.get('/', taskTimeLogController.getLogs);
router.post('/start', taskTimeLogController.startTimer);
router.post('/stop', taskTimeLogController.stopTimer);
router.get('/active', taskTimeLogController.getActiveTimer);
export default router;
