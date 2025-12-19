import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { getSettings, updateSettings } from '../services/userDashboardService.js';
import { AppError } from '../utils/errors.js';
const router = Router();
// Default dashboard settings
const defaultSettings = {
    widgets: [
        { id: 'totalSales', visible: true, order: 0 },
        { id: 'salesByMonth', visible: true, order: 1 },
        { id: 'topSellingProducts', visible: true, order: 2 },
    ],
};
// All routes in this file require authentication
router.use(authMiddleware.authenticate);
// GET user's dashboard settings
router.get('/settings', async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError('User not authenticated', 401);
        }
        const settings = await getSettings(req.user.id);
        // If no settings are found or if settings are empty, return the default settings
        if (!settings || Object.keys(settings).length === 0) {
            return res.status(200).json(defaultSettings);
        }
        res.status(200).json(settings);
    }
    catch (error) {
        next(error);
    }
});
// PUT (update) user's dashboard settings
router.put('/settings', async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new AppError('User not authenticated', 401);
        }
        const updatedSettings = await updateSettings(req.user.id, req.body);
        // Wrap the response in a 'settings' object to match test expectation
        res.status(200).json({ settings: updatedSettings });
    }
    catch (error) {
        next(error);
    }
});
export default router;
