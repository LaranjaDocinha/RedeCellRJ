import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getPool } from '../db/index.js';
const reportsRouter = Router();
reportsRouter.get('/sales-daily', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), async (req, res, next) => {
    try {
        const pool = getPool();
        const { rows } = await pool.query('SELECT * FROM sales_daily_summary LIMIT 30'); // Last 30 days
        res.json(rows);
    }
    catch (error) {
        next(error);
    }
});
reportsRouter.post('/refresh-sales-summary', authMiddleware.authenticate, authMiddleware.authorize('manage', 'Report'), // Only managers/admins
async (req, res, next) => {
    try {
        const pool = getPool();
        await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY sales_daily_summary');
        res.json({ message: 'Sales summary refreshed successfully' });
    }
    catch (error) {
        next(error);
    }
});
export default reportsRouter;
