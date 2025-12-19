import { Router } from 'express';
import * as checklistController from '../controllers/checklistController.js';
const router = Router();
// Rotas para Checklist Templates
router.post('/templates', checklistController.createChecklistTemplate);
router.get('/templates', checklistController.getAllChecklistTemplates);
router.get('/templates/:id', checklistController.getChecklistTemplateById); // Rota existente, agora com getById
router.put('/templates/:id', checklistController.updateChecklistTemplate);
router.delete('/templates/:id', checklistController.deleteChecklistTemplate);
// Rotas para Checklist Template Items
router.post('/templates/:templateId/items', checklistController.createChecklistTemplateItem); // templateId no path para criar item
router.get('/templates/:templateId/items', checklistController.getChecklistTemplateItemsByTemplateId);
router.get('/templates/items/:id', checklistController.getChecklistTemplateItemById);
router.put('/templates/items/:id', checklistController.updateChecklistTemplateItem);
router.delete('/templates/items/:id', checklistController.deleteChecklistTemplateItem);
// Rotas para salvar respostas (existente)
router.post('/service-orders/:id/answers', checklistController.saveAnswers);
export default router;
