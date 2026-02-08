import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { storageProvider } from '../lib/storageProvider.js';
import { catchAsync } from '../utils/catchAsync.js';

const router = Router();
const upload = multer({ dest: 'uploads/temp/' });

router.post(
  '/upload',
  authMiddleware.authenticate,
  upload.single('file'),
  catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Pasta baseada no tipo de arquivo
    const folder = req.file.mimetype.startsWith('audio/')
      ? 'chat/audio'
      : req.file.mimetype.startsWith('image/')
        ? 'chat/images'
        : req.file.mimetype.startsWith('video/')
          ? 'chat/videos'
          : 'chat/docs';

    const fileName = await storageProvider.saveFile(req.file, folder);
    const fileUrl = storageProvider.getUrl(fileName, folder);

    res.json({ fileUrl, type: req.file.mimetype });
  }),
);

export default router;
