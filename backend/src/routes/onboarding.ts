import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

// For employees to see their own progress and complete items
router.get('/me', (req, res) => {
  // @ts-expect-error
  onboardingController.getEmployeeProgress({ params: { userId: req.user.id } }, res);
});
router.put('/me/complete-item', onboardingController.completeItem);

// For managers to manage checklists and employee onboarding
router.use(authMiddleware.authorize('manage', 'Onboarding'));
router.get('/checklists', onboardingController.getChecklists);
router.get('/checklists/:id', onboardingController.getChecklist);
router.post('/assign', onboardingController.assignChecklist);
router.get('/progress/:userId', onboardingController.getEmployeeProgress);

export default router;
