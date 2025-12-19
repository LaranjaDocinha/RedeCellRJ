import { Router } from 'express';
import { apiKeyMiddleware } from '../middlewares/apiKeyMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { apiKeyController } from '../controllers/apiKeyController.js';
const router = Router();
// Routes for managing API keys (requires user authentication)
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'ApiKeys')); // Permission for managing API keys
router.get('/keys', apiKeyController.getUserApiKeys);
router.post('/keys', apiKeyController.generateApiKey);
router.put('/keys/:id', apiKeyController.updateApiKey);
router.delete('/keys/:id', apiKeyController.deleteApiKey);
// --- Public API ---
// This router uses the apiKeyMiddleware for authentication
const publicApiRouter = Router();
publicApiRouter.use(apiKeyMiddleware);
// Example Public Endpoint: Get a list of products
publicApiRouter.get('/products', async (req, res) => {
    // Check if the API key has 'products:read' permission
    const apiKeyPermissions = req.apiKey.permissions;
    if (!apiKeyPermissions || !apiKeyPermissions.products || !apiKeyPermissions.products.includes('read')) {
        return res.status(403).json({ message: 'API Key does not have permission to read products.' });
    }
    // This would typically call a service to fetch products, possibly filtered or limited by API key permissions
    res.json({ message: 'Public products endpoint accessed via API Key', products: [] /* productService.getPublicProducts() */ });
});
export { router as apiKeyRouter, publicApiRouter };
