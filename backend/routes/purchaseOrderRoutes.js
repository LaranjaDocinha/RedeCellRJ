const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const purchaseOrderController = require('../controllers/purchaseOrderController');

const router = express.Router();

// Todas as rotas são protegidas para admin
router.use(authenticateToken, authorizeRoles('admin'));

// POST /api/purchase-orders - Criar uma nova ordem de compra
router.post('/', purchaseOrderController.createPurchaseOrder);

// GET /api/purchase-orders - Listar todas as ordens de compra
router.get('/', purchaseOrderController.getAllPurchaseOrders);

// GET /api/purchase-orders/:id - Obter detalhes de uma ordem de compra
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

// POST /api/purchase-orders/:id/receive - Receber itens de uma ordem de compra
router.post('/:id/receive', purchaseOrderController.receivePurchaseOrderItems);

module.exports = router;