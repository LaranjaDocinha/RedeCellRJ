// backend/src/routes/branding.ts
import { Router } from 'express';
import { getBrandingConfig, updateBrandingConfig } from '../controllers/brandingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const brandingRouter = Router();
brandingRouter.get('/', getBrandingConfig);
brandingRouter.put('/', authMiddleware.authenticate, updateBrandingConfig);
export default brandingRouter;
