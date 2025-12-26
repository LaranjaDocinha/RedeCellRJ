import { Router } from 'express';
import { getCompatibilities, createCompatibility } from '../controllers/compatibilityController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Public or Protected? Let's make it protected for now but viewable by all employees
router.get('/', authMiddleware.authorize('read', 'Product'), getCompatibilities);
router.post('/', authMiddleware.authorize('create', 'Product'), createCompatibility);

export default router;
