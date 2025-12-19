import { Router } from 'express';
import * as meService from '../services/meService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // Assuming a generic auth middleware
const router = Router();
// All routes in this file are protected and refer to the logged-in user
router.use(authMiddleware.authenticate);
router.get('/profile', async (req, res) => {
    const userId = req.user.id;
    const profile = await meService.getMyProfile(userId);
    res.json(profile);
});
router.get('/sales', async (req, res) => {
    const userId = req.user.id;
    const sales = await meService.getMySales(userId);
    res.json(sales);
});
router.get('/service-orders', async (req, res) => {
    const userId = req.user.id;
    const orders = await meService.getMyServiceOrders(userId);
    res.json(orders);
});
export default router;
