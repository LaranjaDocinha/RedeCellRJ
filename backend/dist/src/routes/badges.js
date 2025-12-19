import { Router } from 'express';
import * as badgeController from '../controllers/badgeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
// For now, only admins can manage badges
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'all'));
router.post('/', badgeController.createBadge);
router.get('/', badgeController.getAllBadges);
router.get('/:id', badgeController.getBadgeById);
router.put('/:id', badgeController.updateBadge);
router.delete('/:id', badgeController.deleteBadge);
export default router;
