import { Router } from 'express';
import { createBackup } from '../controllers/backupController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.post('/backup/create', authMiddleware.authenticate, authMiddleware.authorize('create', 'Backup'), createBackup);
export default router;
