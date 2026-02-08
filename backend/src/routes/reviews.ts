import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { query } from '../db/index.js';

const router = Router();

// GET /api/reviews
router.get(
  '/',
  authMiddleware.authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query(`
        SELECT 
          ss.*,
          c.name as customer_name,
          u.name as technician_name
        FROM satisfaction_surveys ss
        LEFT JOIN customers c ON ss.customer_id = c.id
        LEFT JOIN users u ON ss.technician_id = u.id
        ORDER BY ss.created_at DESC
      `);

      // Mapear para o formato esperado pelo frontend se necessário
      const reviews = result.rows.map((r) => ({
        id: r.id,
        customer_name: r.customer_name || 'Anônimo',
        rating_overall: r.rating_overall,
        comment: r.comment,
        store_response: r.store_response,
        sentiment_score: r.sentiment_score || 'Neutral',
        created_at: r.created_at,
        technician: r.technician_name || 'Não informado',
        service: 'Ordem de Serviço #' + r.service_order_id,
      }));

      res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
