import { Router } from 'express';
import { ipWhitelistController } from '../controllers/ipWhitelistController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assuming validate middleware is available
import { createIpEntrySchema, updateIpEntrySchema } from '../controllers/ipWhitelistController.js';
const router = Router();
router.use(authMiddleware.authenticate); // All routes require authentication
router.use(authMiddleware.authorize('manage', 'IPWhitelist')); // Requires specific permission
router.get('/', ipWhitelistController.getAllEntries);
router.post('/', validate(createIpEntrySchema), ipWhitelistController.createEntry);
router.put('/:id', validate(updateIpEntrySchema), ipWhitelistController.updateEntry);
router.delete('/:id', ipWhitelistController.deleteEntry);
export default router;
