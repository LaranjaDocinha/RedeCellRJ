import { Router } from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate, previewTemplate, // Importar o novo método
 } from '../controllers/templateController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.post('/', authMiddleware.authenticate, authMiddleware.authorize('create', 'Template'), createTemplate);
router.get('/', authMiddleware.authenticate, authMiddleware.authorize('read', 'Template'), getTemplates);
router.get('/:id', authMiddleware.authenticate, authMiddleware.authorize('read', 'Template'), getTemplateById);
router.put('/:id', authMiddleware.authenticate, authMiddleware.authorize('update', 'Template'), updateTemplate);
router.delete('/:id', authMiddleware.authenticate, authMiddleware.authorize('delete', 'Template'), deleteTemplate);
// Nova rota para pré-visualização de templates
router.post('/preview', authMiddleware.authenticate, authMiddleware.authorize('read', 'Template'), // A pré-visualização ainda é uma "leitura" de dados de template
previewTemplate);
export default router;
