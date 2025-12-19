import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ocrService } from '../services/ocrService.js'; // Importar o serviço OCR
import { uploadProcessingService } from '../services/uploadProcessingService.js'; // Importar o novo serviço de processamento

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRouter = Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400));
    }
  },
});

export const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only video files are allowed', 400));
    }
  },
});

export const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only image or PDF files are allowed for documents', 400));
    }
  },
});

uploadsRouter.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Upload'), // Assuming an 'Upload' permission
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputDirectory = path.join(__dirname, '..', '..', 'uploads');

    try {
      const optimizedFileName = await uploadProcessingService.processImage(
        filePath,
        outputDirectory,
        fileName,
        { width: 800, quality: 80, format: 'webp' }
      );

      res.status(200).json({ url: `/uploads/${optimizedFileName}` });
    } catch (error) {
      console.error('Error processing image:', error);
      next(new AppError('Failed to process image', 500));
    }
  },
);

uploadsRouter.post(
  '/videos',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Upload'), // Assuming an 'Upload' permission
  uploadVideo.single('video'),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No video file provided', 400));
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    try {
      res.status(200).json({ url: `/uploads/${fileName}` });
    } catch (error) {
      console.error('Error processing video:', error);
      next(new AppError('Failed to process video', 500));
    }
  },
);

uploadsRouter.post(
  '/documents',
  authMiddleware.authenticate,
  authMiddleware.authorize('create', 'Upload'), // Assumindo uma permissão 'Upload'
  uploadDocument.single('document'),
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No document file provided', 400));
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    try {
      // Usar o placeholder do serviço de processamento para OCR
      const { ocrText, extractedData } = await uploadProcessingService.processDocumentOcr(filePath);

      res.status(200).json({
        url: `/uploads/${fileName}`,
        ocr_text: ocrText,
        extracted_data: extractedData,
      });
    } catch (error) {
      console.error('Error processing document with OCR:', error);
      next(new AppError('Failed to process document with OCR', 500));
    }
  },
);

export default uploadsRouter;