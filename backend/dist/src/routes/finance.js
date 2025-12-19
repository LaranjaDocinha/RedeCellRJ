import { Router } from 'express';
import * as financeService from '../services/financeService.js';
import * as ofxService from '../services/ofxService.js'; // Added
import multer from 'multer'; // Added
const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer
router.post('/import-ofx', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const ofxContent = req.file.buffer.toString('utf-8');
        const result = await ofxService.processOfxFile(ofxContent);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error importing OFX' });
    }
});
router.post('/reconcile', async (req, res) => {
    try {
        const count = await ofxService.reconcileTransactions();
        res.json({ message: `Reconciled ${count} transactions` });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error reconciling transactions' });
    }
});
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
