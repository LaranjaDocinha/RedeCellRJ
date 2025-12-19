import { Router } from 'express';
// import * as salesGoalController from '../controllers/salesGoalController.js';
// import { getCurrentDailySalesGoal } from '../controllers/salesGoalController.js';
// import { authMiddleware } from '../middlewares/authMiddleware.js';
// import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
// import {
//   createSalesGoalSchema,
//   updateSalesGoalSchema,
// } from '../controllers/salesGoalController.js'; // TODO: Mover schemas para um arquivo comum
const router = Router();
// TODO: Arquivo de rotas quebrado. Comentado para permitir o build.
// A maioria das funções do controller e schemas não foram encontrados.
// router.use(authMiddleware.authenticate);
// router.use(authMiddleware.authorize('manage', 'SalesGoal')); // Permissão geral para gerenciar metas de vendas
// // Rotas para Metas de Vendas
// router.post('/', validate(createSalesGoalSchema), salesGoalController.createSalesGoal);
// router.get('/', salesGoalController.getAllSalesGoals);
// router.get('/:id', salesGoalController.getSalesGoalById);
// router.put('/:id', validate(updateSalesGoalSchema), salesGoalController.updateSalesGoal);
// router.delete('/:id', salesGoalController.deleteSalesGoal);
// // Rota para obter o progresso de vendas do usuário logado
// router.get('/progress/me', salesGoalController.getMySalesProgress);
// // Rota para obter o progresso de vendas de um usuário específico (admin)
// router.get('/:userId/progress', salesGoalController.getSalesProgress);
// // Rota para obter a meta de vendas diária atual
// router.get(
//   '/current-daily',
//   authMiddleware.authenticate,
//   authMiddleware.authorize('read', 'SalesGoal'),
//   getCurrentDailySalesGoal,
// );
export default router;
