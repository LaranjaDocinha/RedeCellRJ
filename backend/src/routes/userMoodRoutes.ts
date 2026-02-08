import { Router } from 'express';
import { userMoodController } from '../controllers/userMoodController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/report', authMiddleware.authenticate, userMoodController.reportMood);

export default router;