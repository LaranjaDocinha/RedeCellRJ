import { Router } from 'express';
import * as recommendationService from '../services/recommendationService.js';
const router = Router();
router.get('/:id/recommendations', async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const customerId = req.query.customer_id
            ? parseInt(req.query.customer_id, 10)
            : undefined; // Opcional
        const recommendations = await recommendationService.getProductRecommendations(productId, customerId);
        res.json(recommendations);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error getting recommendations' });
    }
});
router.get('/customer/:customerId/personalized-recommendations', async (req, res) => {
    try {
        const customerId = parseInt(req.params.customerId, 10);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: 'Customer ID is required and must be a number' });
        }
        const recommendations = await recommendationService.getPersonalizedRecommendations(customerId);
        res.json(recommendations);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error getting personalized recommendations' });
    }
});
export default router;
