import { Router } from 'express';
import * as financeService from '../services/financeService.js';
const router = Router();
router.get('/p-and-l', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await financeService.getSimplePLReport(startDate, endDate);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching P&L report' });
    }
});
router.get('/cash-flow', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await financeService.getCashFlowReport(startDate, endDate);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching cash flow report' });
    }
});
export default router;
