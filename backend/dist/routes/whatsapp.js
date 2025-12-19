import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware.js';
const whatsappRouter = Router();
const sendWhatsappSchema = z.object({
    phone: z.string().min(10, 'Phone number is too short').nonempty('Phone is required'),
    message: z.string().nonempty('Message is required'),
    attachmentUrl: z.string().url().optional(), // Optional PDF/Image URL
});
// Mock service for now
const whatsappService = {
    async send(phone, message, attachmentUrl) {
        // In a real implementation, this would call Twilio, WppConnect, or Z-API
        console.log(`[WhatsappService] Sending to ${phone}: "${message}" ${attachmentUrl ? `(Attachment: ${attachmentUrl})` : ''}`);
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true, messageId: 'mock-msg-id-' + Date.now() };
    },
};
whatsappRouter.post('/send', authMiddleware.authenticate, 
// authMiddleware.authorize('create', 'Communication'), // Assuming permissions
validate(sendWhatsappSchema), async (req, res, next) => {
    try {
        const { phone, message, attachmentUrl } = req.body;
        const result = await whatsappService.send(phone, message, attachmentUrl);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
export default whatsappRouter;
