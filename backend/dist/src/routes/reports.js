import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getPool } from '../db/index.js';
import { financeService } from '../services/financeService.js'; // Added import
const reportsRouter = Router();
reportsRouter.get('/sales-daily', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), cacheMiddleware(), // Aplicar cacheMiddleware aqui
async (req, res, next) => {
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
router.get('/profitability', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }
        const report = await financeService.getProductProfitabilityReport(startDate, endDate);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
});
router.get('/sales-goals-progress', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), // Or a more specific permission
async (req, res, next) => {
    try {
        const { userId, branchId } = req.query;
        if (!userId && !branchId) {
            return res.status(400).json({ message: 'Either userId or branchId is required.' });
        }
        const progress = await salesGoalService.getSalesGoalProgress({
            userId: userId ? String(userId) : undefined,
            branchId: branchId ? parseInt(String(branchId), 10) : undefined,
        });
        res.json(progress);
    }
    catch (error) {
        next(error);
    }
});
export default reportsRouter;
