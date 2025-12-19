import { Router } from 'express';
import * as knowledgeBaseController from '../controllers/knowledgeBaseController.js'; // Importa o novo controlador
const router = Router();
// Rotas para Artigos da Base de Conhecimento
router.post('/articles', knowledgeBaseController.createArticle);
router.get('/articles', knowledgeBaseController.getAllArticles);
router.get('/articles/:id', knowledgeBaseController.getArticleById);
router.put('/articles/:id', knowledgeBaseController.updateArticle);
router.delete('/articles/:id', knowledgeBaseController.deleteArticle);
// Rota de busca (existente, mas agora no controlador)
router.get('/articles/search', knowledgeBaseController.findArticles);
// Rotas para Anexos da Base de Conhecimento
router.post('/attachments', knowledgeBaseController.createAttachment);
router.get('/articles/:articleId/attachments', knowledgeBaseController.getAttachmentsByArticleId);
router.delete('/attachments/:id', knowledgeBaseController.deleteAttachment);
export default router;
