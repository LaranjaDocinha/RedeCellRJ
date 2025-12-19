import { Router } from 'express';
import { createSandboxEnvironment } from '../controllers/sandboxController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post(
  '/sandbox/create',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Sandbox'),
  createSandboxEnvironment,
);

export default router;
