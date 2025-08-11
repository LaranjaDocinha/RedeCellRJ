const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const salesController = require('../controllers/salesController');

// Criar uma nova venda
router.post('/', [authenticateToken, authorize('sales:create')], salesController.createSale);

// Obter todas as vendas
router.get('/', [authenticateToken, authorize('sales:read')], salesController.getAllSales);

// Obter uma venda por ID
router.get('/:id', [authenticateToken, authorize('sales:read')], salesController.getSaleById);

// Obter histórico de vendas
router.get('/history', [authenticateToken, authorize('sales:read')], salesController.getSalesHistory);

module.exports = router;