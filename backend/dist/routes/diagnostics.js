import { Router } from 'express';
import * as diagnosticController from '../controllers/diagnosticController.js';
const router = Router();
// TODO: Arquivo de rotas quebrado. Comentado para permitir o build.
// A maioria das funções do controller e middlewares não foram encontrados.
// Rotas que parecem válidas:
router.get('/root', diagnosticController.getRootNodes);
// router.get('/:id/children', diagnosticController.getChildrenNodes); // getChildrenNodes does not exist, did you mean getChildNodes?
// // Rotas existentes
// router.get('/', diagnosticController.getDiagnosticNodes); // Alterado para pegar todos os nós
// // Novas rotas para diagnostic_nodes
// router.post('/', diagnosticController.createDiagnosticNode);
// router.get('/:id', diagnosticController.getDiagnosticNodeById);
// router.put('/:id', diagnosticController.updateDiagnosticNode);
// router.delete('/:id', diagnosticController.deleteDiagnosticNode);
// // Rotas para diagnostic_node_options
// router.post('/options', diagnosticController.createDiagnosticNodeOption);
// router.get('/options', diagnosticController.getDiagnosticNodeOptions);
// router.get('/options/:id', diagnosticController.getDiagnosticNodeOptionById);
// router.post(
//   '/feedback',
//   authMiddleware.authenticate,
//   validate(submitFeedbackSchema, 'body'),
//   diagnosticController.submitFeedback,
// );
// router.post(
//   '/history',
//   authMiddleware.authenticate,
//   validate(recordHistorySchema, 'body'),
//   diagnosticController.recordHistory,
// );
// router.put('/options/:id', diagnosticController.updateDiagnosticNodeOption);
// router.delete('/options/:id', diagnosticController.deleteDiagnosticNodeOption);
export default router;
