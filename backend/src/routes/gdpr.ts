import { Router } from 'express';
import { gdprService } from '../services/gdprService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate); // All routes require authentication

// Endpoint to export user data
router.get('/export', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const userData = await gdprService.exportUserData(userId);
    res.json(userData);
  } catch (error) {
    next(error);
  }
});

// Endpoint to delete user data (requires re-authentication or strong confirmation)
router.delete('/delete', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    // Potentially require password confirmation here
    await gdprService.deleteUserData(userId);
    res.status(204).send({ message: 'User data deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
