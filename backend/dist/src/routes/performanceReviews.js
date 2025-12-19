import { Router } from 'express';
import * as performanceReviewController from '../controllers/performanceReviewController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
// Managers can manage reviews, employees can see their own.
router.post('/', authMiddleware.authorize('manage', 'PerformanceReviews'), performanceReviewController.createPerformanceReview);
router.get('/', performanceReviewController.getPerformanceReviews);
router.get('/:id', performanceReviewController.getPerformanceReviewById);
router.put('/:id', authMiddleware.authorize('manage', 'PerformanceReviews'), performanceReviewController.updatePerformanceReview);
router.delete('/:id', authMiddleware.authorize('manage', 'PerformanceReviews'), performanceReviewController.deletePerformanceReview);
export default router;
