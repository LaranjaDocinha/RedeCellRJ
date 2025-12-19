import { Router } from 'express';
import { marketingAutomationService } from '../services/marketingAutomationService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Marketing'));
router.post('/', async (req, res, next) => {
    try {
        const { name, trigger_type, trigger_config, steps } = req.body;
        const newAutomation = await marketingAutomationService.createAutomation(name, trigger_type, trigger_config, steps);
        res.status(201).json(newAutomation);
    }
    catch (error) {
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const automations = await marketingAutomationService.getAllAutomations();
        res.json(automations);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const automation = await marketingAutomationService.getAutomation(parseInt(req.params.id));
        if (!automation) {
            return res.status(404).json({ message: 'Automation not found' });
        }
        res.json(automation);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { name, is_active, trigger_type, trigger_config, steps } = req.body;
        const updatedAutomation = await marketingAutomationService.updateAutomation(parseInt(req.params.id), name, is_active, trigger_type, trigger_config, steps);
        res.json(updatedAutomation);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await marketingAutomationService.deleteAutomation(parseInt(req.params.id));
        if (!deleted) {
            return res.status(404).json({ message: 'Automation not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
export default router;
