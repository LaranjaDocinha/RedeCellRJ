import { Router } from 'express';
import { twoFactorAuthService } from '../services/twoFactorAuthService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { AppError } from '../utils/errors.js';
const router = Router();
// Endpoint to generate 2FA secret and QR code
router.post('/2fa/generate', authMiddleware.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userEmail = req.user.email; // Assuming email is in user payload
        const { secret, otpauthUrl, qrCodeDataURL } = await twoFactorAuthService.generateSecret(userId, userEmail);
        res.json({ secret, otpauthUrl, qrCodeDataURL });
    }
    catch (error) {
        next(error);
    }
});
// Endpoint to verify a 2FA token
router.post('/2fa/verify', authMiddleware.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
        if (!token) {
            throw new AppError('2FA token is required', 400);
        }
        const verified = await twoFactorAuthService.verifyToken(userId, token);
        if (!verified) {
            return res.status(401).json({ message: 'Invalid 2FA token.' });
        }
        res.json({ verified: true });
    }
    catch (error) {
        next(error);
    }
});
// Endpoint to enable 2FA (after successful verification)
router.post('/2fa/enable', authMiddleware.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { token } = req.body; // Token is passed again to verify before enabling
        if (!token) {
            throw new AppError('2FA token is required to enable.', 400);
        }
        const verified = await twoFactorAuthService.verifyToken(userId, token);
        if (!verified) {
            return res.status(401).json({ message: 'Invalid 2FA token.' });
        }
        await twoFactorAuthService.enable2FA(userId);
        res.json({ message: '2FA enabled successfully.' });
    }
    catch (error) {
        next(error);
    }
});
// Endpoint to disable 2FA
router.post('/2fa/disable', authMiddleware.authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        await twoFactorAuthService.disable2FA(userId);
        res.json({ message: '2FA disabled successfully.' });
    }
    catch (error) {
        next(error);
    }
});
// Endpoint for 2FA login (after password verification)
router.post('/login/2fa', async (req, res, next) => {
    try {
        const { userId, token } = req.body; // userId is passed from initial login attempt
        if (!userId || !token) {
            throw new AppError('User ID and 2FA token are required for 2FA login.', 400);
        }
        const verified = await twoFactorAuthService.verifyToken(userId, token);
        if (!verified) {
            return res.status(401).json({ message: 'Invalid 2FA token.' });
        }
        // If verified, generate JWT token
        const { authService } = await import('../services/authService.js'); // Lazy import to avoid circular dependency
        const loginResult = await authService.generateTokenFor2FA(userId); // New method in authService
        res.json(loginResult);
    }
    catch (error) {
        next(error);
    }
});
export default router;
