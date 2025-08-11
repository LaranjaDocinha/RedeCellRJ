const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Criar uma nova ordem de compra
router.post('/', [authenticateToken, authorize('products:create')], purchaseOrderController.createPurchaseOrder);

// Obter todas as ordens de compra
router.get('/', [authenticateToken, authorize('products:read')], purchaseOrderController.getAllPurchaseOrders);

// Obter uma ordem de compra por ID
router.get('/:id', [authenticateToken, authorize('products:read')], purchaseOrderController.getPurchaseOrderById);

// Atualizar uma ordem de compra
router.put('/:id', [authenticateToken, authorize('products:update')], purchaseOrderController.updatePurchaseOrder);

module.exports = router;
