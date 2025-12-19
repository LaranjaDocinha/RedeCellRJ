import { Router } from 'express';
import * as activityFeedController from '../controllers/activityFeedController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.get('/', activityFeedController.getFeed);
export default router;
