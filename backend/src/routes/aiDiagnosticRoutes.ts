import { Router } from 'express';
import multer from 'multer';
import { aiDiagnosticController } from '../controllers/aiDiagnosticController.js';
import { aiHelpController } from '../controllers/aiHelpController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const upload = multer({ dest: 'uploads/temp/' }); // Temp storage for analysis
const router = Router();

router.post(
  '/analyze',
  authMiddleware.authenticate,
  upload.single('image'),
  aiDiagnosticController.analyze,
);
router.post('/chat', authMiddleware.authenticate, aiHelpController.chat);

export default router;
