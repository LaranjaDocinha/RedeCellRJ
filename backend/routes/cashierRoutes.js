const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  openCashier, 
  closeCashier, 
  getCashierStatus, 
  getCashierHistory,
  getCashierSummary
} = require('../controllers/cashierController');

router.use(authenticateToken);

router.post('/open', openCashier);
router.post('/close', closeCashier);
router.get('/status', getCashierStatus);
router.get('/history', getCashierHistory);
router.get('/summary', getCashierSummary);

module.exports = router;
