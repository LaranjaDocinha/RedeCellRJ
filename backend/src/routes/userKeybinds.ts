import { Router } from 'express';
import { userKeybindController } from '../controllers/userKeybindController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assuming validate middleware is available
import { createKeybindSchema, updateKeybindSchema } from '../controllers/userKeybindController.js';

const router = Router();

router.use(authMiddleware.authenticate); // All routes require authentication

router.get('/', userKeybindController.getUserKeybinds);
router.post('/', validate(createKeybindSchema), userKeybindController.createKeybind);
router.put('/:id', validate(updateKeybindSchema), userKeybindController.updateKeybind);
router.delete('/:id', userKeybindController.deleteKeybind);

export default router;
