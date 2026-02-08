import { Router } from 'express';
import * as ifixitService from '../services/ifixitService.js';
import * as serviceOrderService from '../services/serviceOrderService.js'; // Para buscar a descrição do produto da OS

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const guides = await ifixitService.searchGuides(query);
    res.json(guides);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error searching for guides' });
  }
});

router.get('/guides/:guideId', async (req, res) => {
  try {
    const guideId = parseInt(req.params.guideId, 10);
    if (isNaN(guideId)) {
      return res.status(400).json({ message: 'Guide ID is required and must be a number' });
    }
    const guideDetails = await ifixitService.getGuideDetails(guideId);
    res.json(guideDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching guide details' });
  }
});

router.get('/service-order/:serviceOrderId/guides', async (req, res) => {
  try {
    const serviceOrderId = parseInt(req.params.serviceOrderId, 10);
    if (isNaN(serviceOrderId)) {
      return res.status(400).json({ message: 'Service Order ID is required and must be a number' });
    }

    const serviceOrder = await serviceOrderService.getServiceOrderById(serviceOrderId);
    if (!serviceOrder) {
      return res.status(404).json({ message: 'Service Order not found' });
    }

    const device = serviceOrder.product_description; // Usar a descrição do produto da OS como termo de busca
    if (!device) {
      return res
        .status(400)
        .json({ message: 'Product description not found for this service order' });
    }

    const guides = await ifixitService.searchGuides(device);
    res.json(guides);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message || 'Error searching for guides for service order' });
  }
});

export default router;
