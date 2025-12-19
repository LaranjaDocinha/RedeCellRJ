import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db/index.js';
const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'attachments');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image or video files are allowed'));
        }
    },
});
router.post('/:id/attachments', upload.single('attachment'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        const serviceOrderId = parseInt(req.params.id, 10);
        const userId = req.user?.id || 1; // Mock user ID
        const { description } = req.body;
        const filePath = `/uploads/attachments/${req.file.filename}`;
        const fileType = req.file.mimetype;
        const result = await pool.query('INSERT INTO service_order_attachments (service_order_id, file_path, file_type, description, uploaded_by_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [serviceOrderId, filePath, fileType, description, userId]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading attachment' });
    }
});
export default router;
