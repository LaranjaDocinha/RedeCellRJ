const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const supplierController = require('../controllers/supplierController');

// Obter todos os fornecedores
router.get('/', [authenticateToken, authorize('products:read')], supplierController.getAllSuppliers);

// Criar um novo fornecedor
router.post('/', [authenticateToken, authorize('products:create')], supplierController.createSupplier);

// Atualizar um fornecedor
router.put('/:id', [authenticateToken, authorize('products:update')], supplierController.updateSupplier);

// Deletar um fornecedor
router.delete('/:id', [authenticateToken, authorize('products:delete')], supplierController.deleteSupplier);

module.exports = router;