import { Router } from 'express';
import { auditService } from '../services/auditService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/log', authMiddleware.authenticate, async (req, res) => {
  const { action, entityType, details } = req.body;
  const userId = (req as any).user.id;
  await auditService.logAction(userId, action, entityType, details);
  res.status(204).send();
});

export default router;