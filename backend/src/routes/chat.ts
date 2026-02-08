import { Router } from 'express';
import { chatService } from '../services/chatService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/messages', authMiddleware.authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { contactId, limit, offset } = req.query;

    const messages = await chatService.getMessages(
      userId,
      contactId as string | undefined,
      limit ? parseInt(limit as string) : 50,
      offset ? parseInt(offset as string) : 0,
    );

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
