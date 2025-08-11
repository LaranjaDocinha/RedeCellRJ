const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const repairController = require('../controllers/repairController');

// Obter todas as ordens de reparo
router.get('/', [authenticateToken, authorize('repairs:read')], repairController.getAllRepairs);

// Obter uma ordem de reparo por ID
router.get('/:id', [authenticateToken, authorize('repairs:read')], repairController.getRepairById);

// Obter detalhes da garantia de um reparo
router.get('/:id/warranty', [authenticateToken, authorize('repairs:read')], repairController.getRepairWarrantyDetails);

// Criar uma nova ordem de reparo
router.post('/', [authenticateToken, authorize('repairs:create')], repairController.createRepair);

// Atualizar uma ordem de reparo
router.put('/:id', [authenticateToken, authorize('repairs:update')], repairController.updateRepair);

// Deletar uma ordem de reparo
router.delete('/:id', [authenticateToken, authorize('repairs:delete')], repairController.deleteRepair);

// Atualizar o status de uma ordem de reparo
router.patch('/:id/status', [authenticateToken, authorize('repairs:update')], repairController.updateRepairStatus);

// Rotas para o novo sistema de Checklists
router.post('/:id/checklists', [authenticateToken, authorize('repairs:update')], repairController.assignChecklistToRepair);
router.get('/:id/checklists', [authenticateToken, authorize('repairs:read')], repairController.getChecklistsForRepair);
router.put('/:id/checklists/:instanceId', [authenticateToken, authorize('repairs:update')], repairController.saveChecklistAnswers);

// Rotas para Time Tracking
router.post('/:id/time-entries', [authenticateToken, authorize('repairs:update')], repairController.addTimeEntry);
router.get('/:id/time-entries', [authenticateToken, authorize('repairs:read')], repairController.getTimeEntries);
router.delete('/:repairId/time-entries/:entryId', [authenticateToken, authorize('repairs:update')], repairController.deleteTimeEntry);

// Rota para configurações do Kanban
router.get('/kanban/settings', [authenticateToken, authorize('repairs:read')], repairController.getKanbanSettings);
router.post('/kanban/settings', [authenticateToken, authorize('repairs:update')], repairController.updateKanbanSettings);

// Rota para upload de assinatura
router.post('/upload-signature', [authenticateToken, authorize('repairs:update')], repairController.uploadSignature);

// Rota para histórico do aparelho por serial/IMEI
router.get('/device-history/:serialNumber', [authenticateToken, authorize('repairs:read')], repairController.getDeviceHistoryBySerial);

module.exports = router;