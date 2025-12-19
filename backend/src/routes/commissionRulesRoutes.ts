import { Router } from 'express';
import { CommissionRulesController } from '../controllers/CommissionRulesController.js';
import { CommissionRulesService } from '../services/CommissionRulesService.js';

const router = Router();

const commissionRulesService = new CommissionRulesService();
const commissionRulesController = new CommissionRulesController(commissionRulesService);

router.post('/commission-rules', (req, res) =>
  commissionRulesController.createCommissionRule(req, res),
);
router.get('/commission-rules', (req, res) =>
  commissionRulesController.getCommissionRules(req, res),
);
router.get('/commission-rules/:id', (req, res) =>
  commissionRulesController.getCommissionRuleById(req, res),
);
router.put('/commission-rules/:id', (req, res) =>
  commissionRulesController.updateCommissionRule(req, res),
);
router.delete('/commission-rules/:id', (req, res) =>
  commissionRulesController.deleteCommissionRule(req, res),
);

export default router;
