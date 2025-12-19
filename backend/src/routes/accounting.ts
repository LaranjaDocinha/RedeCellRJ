import { Router } from 'express';
import * as accountingService from '../services/accountingService.js';

const router = Router();

router.get('/export/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const csvData = await accountingService.exportSalesForAccounting(startDate, endDate);
    res.header('Content-Type', 'text/csv');
    res.attachment(`sales-export-${Date.now()}.csv`);
    res.send(csvData);
  } catch (error: any) { // Explicitly type error
    res.status(500).json({ message: error.message || 'Error exporting sales data' });
  }
});

export default router;
