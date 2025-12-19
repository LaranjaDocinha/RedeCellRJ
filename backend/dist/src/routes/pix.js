import { Router } from 'express';
import { generatePixQrCode, handlePixWebhook, checkPixPaymentStatus } from '../controllers/pixController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const pixRouter = Router();
// Route to generate a dynamic PIX QR Code
pixRouter.post('/generate-qr', authMiddleware.authenticate, authMiddleware.authorize('create', 'PixPayment'), // Assuming a 'PixPayment' subject for authorization
generatePixQrCode);
// Route to check PIX payment status
pixRouter.get('/status/:transactionId', authMiddleware.authenticate, authMiddleware.authorize('read', 'PixPayment'), // Assuming 'read' permission for PixPayment
checkPixPaymentStatus);
// Route to handle PIX webhooks (payment confirmations)
// This route typically does not require authentication as it's called by the PIX provider
pixRouter.post('/webhook', handlePixWebhook);
export default pixRouter;
