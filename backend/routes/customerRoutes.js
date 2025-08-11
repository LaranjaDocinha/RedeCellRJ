const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');

// Obter todos os clientes
router.get('/', [authenticateToken, authorize('customers:read')], customerController.getAllCustomers);

// Obter um cliente por ID
router.get('/:id', [authenticateToken, authorize('customers:read')], customerController.getCustomerById);

// Criar um novo cliente
router.post('/', [authenticateToken, authorize('customers:create')], customerController.createCustomer);

// Atualizar um cliente
router.put('/:id', [authenticateToken, authorize('customers:update')], customerController.updateCustomer);

// Deletar um cliente
router.delete('/:id', [authenticateToken, authorize('customers:delete')], customerController.deleteCustomer);

// Rotas para Histórico de Interações
router.post('/:id/interactions', [authenticateToken, authorize('customers:update')], customerController.addInteraction);
router.get('/:id/interactions', [authenticateToken, authorize('customers:read')], customerController.getInteractions);
router.delete('/:customerId/interactions/:interactionId', [authenticateToken, authorize('customers:update')], customerController.deleteInteraction);

// Nova rota para obter todas as interações de clientes
router.get('/interactions', [authenticateToken, authorize('customers:read')], customerController.getAllCustomerInteractions);

module.exports = router;