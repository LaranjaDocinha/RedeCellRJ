import { Router } from 'express';
import * as extendedReportService from '../services/extendedReportService.js';
const router = Router();
router.get('/repair-profitability', async (req, res) => {
    try {
        const data = await extendedReportService.getRepairProfitability();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error fetching report' });
    }
});
export default router;
