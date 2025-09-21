var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/errors.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRouter = Router();
// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads');
        // In a real application, you might want to ensure this directory exists
        // or use a more robust solution like cloud storage.
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new AppError('Only image files are allowed', 400));
        }
    }
});
uploadsRouter.post('/', authMiddleware.authenticate, authMiddleware.authorize('create', 'Upload'), // Assuming an 'Upload' permission
upload.single('image'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return next(new AppError('No image file provided', 400));
    }
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const optimizedFileName = `optimized-${fileName}`;
    const outputPath = path.join(path.dirname(filePath), optimizedFileName);
    try {
        yield sharp(filePath)
            .resize(800) // Resize image to a max width of 800px
            .webp({ quality: 80 }) // Convert to webp for better compression
            .toFile(outputPath);
        // You might want to delete the original file after optimization
        // fs.unlinkSync(filePath);
        // Return the URL to the optimized image
        // In a production environment, this URL would likely be from a CDN or cloud storage
        res.status(200).json({ url: `/uploads/${optimizedFileName}` });
    }
    catch (error) {
        console.error('Error processing image:', error);
        next(new AppError('Failed to process image', 500));
    }
}));
export default uploadsRouter;
