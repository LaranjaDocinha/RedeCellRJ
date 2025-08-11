const express = require('express');
const router = express.Router();
const { authenticateToken, admin } = require('../middleware/authMiddleware');
const {
  createStockTransfer,
  getAllStockTransfers,
  completeStockTransfer,
  cancelStockTransfer,
} = require('../controllers/stockTransferController');

// All routes here are prefixed with /api/stock/transfers

router.route('/')
  .post(authenticateToken, createStockTransfer) // Any authenticated user can request a transfer
  .get(authenticateToken, getAllStockTransfers); // Any authenticated user can view transfers

router.route('/:id/complete')
  .put(authenticateToken, admin, completeStockTransfer); // Only admins can complete

router.route('/:id/cancel')
  .put(authenticateToken, admin, cancelStockTransfer); // Only admins can cancel

module.exports = router;
