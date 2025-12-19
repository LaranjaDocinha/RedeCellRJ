import { Router, Request, Response, NextFunction } from 'express';
import { rfmService } from '../services/rfmService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('read', 'Customers'));

router.get('/segments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const segments = await rfmService.getSegmentCounts();
    res.json(segments);
  } catch (error) {
    next(error);
  }
});

router.get('/segments/:segmentName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { segmentName } = req.params;
    const customers = await rfmService.getCustomersBySegment(segmentName);
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

export default router;
