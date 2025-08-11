const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const usedProductController = require('../controllers/usedProductController');

// Obter todos os produtos seminovos
router.get('/', [authenticateToken, authorize('used_products:read')], usedProductController.getAllUsedProducts);

// Obter um produto seminovo por ID
router.get('/:id', [authenticateToken, authorize('used_products:read')], usedProductController.getUsedProductById);

// Criar um novo produto seminovo
router.post('/', [authenticateToken, authorize('used_products:create')], usedProductController.createUsedProduct);

// Atualizar um produto seminovo
router.put('/:id', [authenticateToken, authorize('used_products:update')], usedProductController.updateUsedProduct);

// Deletar um produto seminovo
router.delete('/:id', [authenticateToken, authorize('used_products:delete')], usedProductController.deleteUsedProduct);

// Registrar a compra de um produto seminovo de um cliente
router.post('/purchase', [authenticateToken, authorize('used_products:purchase')], usedProductController.purchaseUsedProductFromCustomer);

// Registrar a venda de um produto seminovo para um cliente
router.post('/sell', [authenticateToken, authorize('used_products:sell')], usedProductController.sellUsedProductToCustomer);

// Obter histórico de transações de um produto seminovo
router.get('/:id/transactions', [authenticateToken, authorize('used_products:read')], usedProductController.getUsedProductTransactions);

module.exports = router;
