import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { query } from '../db/index.js';

const router = Router();

// GET /api/coupons
router.get(
  '/',
  authMiddleware.authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  }
);

export default router;