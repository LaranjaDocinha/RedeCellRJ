import { Router } from 'express';
import { getPnlReport } from '../controllers/pnlReportController.js';

const router = Router();

router.get('/pnl-report', getPnlReport);

export default router;
