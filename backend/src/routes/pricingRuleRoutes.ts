import { Router } from 'express';
import { pricingRuleController } from '../controllers/pricingRuleController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas administrativas devem ser autenticadas e autorizadas
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'PricingRules')); // Exemplo de permissão

router.get('/rules', pricingRuleController.getAllRules);
router.get('/rules/:id', pricingRuleController.getRuleById);
router.post('/rules', pricingRuleController.createRule);
router.put('/rules/:id', pricingRuleController.updateRule);
router.delete('/rules/:id', pricingRuleController.deleteRule);

export default router;
