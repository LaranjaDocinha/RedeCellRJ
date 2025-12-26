import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { query } from '../db/index.js';

const router = Router();

// GET /api/quarantine
router.get(
  '/',
  authMiddleware.authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await query(`
        SELECT 
          qi.*,
          p.name as product_name,
          pv.name as variation,
          s.name as supplier
        FROM quarantine_items qi
        LEFT JOIN products p ON qi.product_id = p.id
        LEFT JOIN product_variations pv ON qi.variation_id = pv.id
        LEFT JOIN suppliers s ON qi.supplier_id = s.id
        ORDER BY qi.created_at DESC
      `);
      
      res.status(200).json(result.rows);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/quarantine
const createQuarantineItemSchema = z.object({
  product_id: z.number().optional(),
  variation_id: z.number().optional(),
  supplier_id: z.number().optional(),
  quantity: z.number().min(1),
  reason: z.string().nonempty(),
  status: z.string().default('Pending'),
  is_battery_risk: z.boolean().default(false),
  item_cost: z.number().default(0),
});

router.post(
  '/',
  authMiddleware.authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createQuarantineItemSchema.parse(req.body);
      
      const result = await query(
        `INSERT INTO quarantine_items 
         (product_id, variation_id, supplier_id, quantity, reason, status, is_battery_risk, item_cost, identified_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          data.product_id,
          data.variation_id,
          data.supplier_id,
          data.quantity,
          data.reason,
          data.status,
          data.is_battery_risk,
          data.item_cost,
          (req as any).user.id
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
