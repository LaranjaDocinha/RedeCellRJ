import { Router, Request, Response, NextFunction } from 'express';
import { referralService } from '../services/referralService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/my-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id; // Assuming user id is customer id
    if (!customerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const code = await referralService.generateReferralCode(customerId);
    res.json({ referral_code: code });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const history = await referralService.getReferralHistory(customerId);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
