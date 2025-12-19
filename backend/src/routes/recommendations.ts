import { Router } from 'express';
import * as recommendationService from '../services/recommendationService.js';

const router = Router();

router.get('/:id/recommendations', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const customerId = req.query.customer_id
      ? parseInt(req.query.customer_id as string, 10)
      : undefined; // Opcional
    const recommendations = await recommendationService.getProductRecommendations(
      productId,
      customerId,
    );
    res.json(recommendations);
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting personalized recommendations' });
  }
});

router.post('/cart-upsell', async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
        return res.status(400).json({ message: 'productIds must be an array' });
    }
    const recommendations = await recommendationService.getCartUpsellRecommendations(productIds);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting upsell recommendations' });
  }
});

router.post('/collaborative', async (req, res) => {
  try {
    const { customerHistoryProductIds, excludeProductIds = [] } = req.body;
    if (!Array.isArray(customerHistoryProductIds)) {
      return res.status(400).json({ message: 'customerHistoryProductIds must be an array' });
    }
    const recommendations = await recommendationService.getCollaborativeRecommendations(customerHistoryProductIds, excludeProductIds);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting collaborative recommendations' });
  }
});

export default router;
