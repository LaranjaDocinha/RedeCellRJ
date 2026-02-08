import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { commissionService } from '../services/commissionService.js';

const performanceRouter = Router();

performanceRouter.get('/my-performance', authMiddleware.authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user?.id; // Pega o ID do usuário logado

    const performance = await commissionService.getSalespersonPerformance(
      userId as string,
      (startDate as string) || '2025-01-01',
      (endDate as string) || '2025-12-31',
    );

    res.json(performance);
  } catch (error) {
    next(error);
  }
});

export default performanceRouter;
