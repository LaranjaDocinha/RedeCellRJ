import { Router } from 'express';
import * as financeService from '../services/financeService.js';
import { uploadOfx } from '../controllers/ofxController.js'; // Updated import
import * as ofxService from '../services/ofxService.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'temp/' }); // Save to temp disk

router.post('/import-ofx', upload.single('file'), uploadOfx);

router.post('/reconcile', async (req, res) => {
  try {
    const count = await ofxService.reconcileTransactions();
    res.json({ message: `Reconciled ${count} transactions` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error reconciling transactions' });
  }
});

router.get('/p-and-l', async (req, res) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const data = await financeService.getSimplePLReport(startDate, endDate);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching P&L report' });
  }
});

router.get('/cash-flow', async (req, res) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const data = await financeService.getCashFlowReport(startDate, endDate);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching cash flow report' });
  }
});

export default router;
