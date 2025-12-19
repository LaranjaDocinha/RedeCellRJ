import { Router } from 'express';
import * as ecommerceService from '../services/ecommerceService.js';

const router = Router();

router.post('/sync/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await ecommerceService.syncProductToShopify(parseInt(productId, 10));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error syncing product' });
  }
});

router.post('/pull-orders', async (req, res) => {
  try {
    const result = await ecommerceService.pullOrdersFromShopify();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error pulling orders' });
  }
});

export default router;
