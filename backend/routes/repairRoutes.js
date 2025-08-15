const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const repairController = require('../controllers/repairController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Proteger todas as rotas
router.use(authenticateToken);

// Rotas CRUD para Reparos
router.get('/', 
  authorize('repairs:read'), 
  repairController.getAllRepairsByStatus
);

router.post('/', 
  authorize('repairs:create'), 
  // Adicionar validação de body aqui se necessário
  repairController.createRepair
);

router.get('/:id', 
  authorize('repairs:read'), 
  param('id').isInt(), 
  validate, 
  repairController.getRepairById
);

router.put('/:id', 
  authorize('repairs:update'), 
  param('id').isInt(), 
  // Adicionar validação de body aqui se necessário
  repairController.updateRepair
);

router.delete('/:id', 
  authorize('repairs:delete'), 
  param('id').isInt(), 
  validate, 
  repairController.deleteRepair
);

// Rotas específicas para o Kanban
router.get('/by-status', 
  authorize('repairs:read'), 
  query('technician_id').optional().isInt(),
  validate,
  repairController.getAllRepairsByStatus
);

router.patch('/:id/status', 
  authorize('repairs:update'), 
  param('id').isInt(),
  body('status').notEmpty().withMessage('Status é obrigatório.'),
  validate,
  repairController.updateRepairStatus
);

router.patch('/:id/assign-technician', 
  authorize('repairs:update'), 
  param('id').isInt(),
  body('technician_id').isInt().optional({ nullable: true }).withMessage('ID do técnico inválido.'),
  validate,
  repairController.assignTechnician
);

// Rota para métricas do Kanban
router.get('/kanban-metrics',
  authorize('reports:view:operational'),
  [
    query('startDate').isISO8601().toDate().withMessage('Data de início inválida.'),
    query('endDate').isISO8601().toDate().withMessage('Data de fim inválida.'),
    validate // Moved inside the array
  ],
  repairController.getKanbanMetrics
);

// Rota para obter as configurações do Kanban
router.get('/kanban/settings',
  authorize('repairs:read'),
  repairController.getKanbanSettings
);

module.exports = router;