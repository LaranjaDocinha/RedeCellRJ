import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getRootNodes,
  getChildNodes,
  getNodeOptions,
  submitFeedback,
  recordHistory,
  validate,
  nodeIdSchema,
  submitFeedbackSchema,
  recordHistorySchema,
} from '../controllers/diagnosticController.js';

const router = Router();

router.get('/root', getRootNodes);
router.get('/:nodeId/children', validate(nodeIdSchema), getChildNodes);
router.get('/:nodeId/options', validate(nodeIdSchema), getNodeOptions);

router.post(
  '/feedback',
  authMiddleware.authenticate,
  validate(submitFeedbackSchema, 'body'),
  submitFeedback,
);

router.post(
  '/history',
  authMiddleware.authenticate,
  validate(recordHistorySchema, 'body'),
  recordHistory,
);

export default router;