import { Router } from 'express';
import { marketplaceConfigController } from '../controllers/marketplaceConfigController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas administrativas devem ser autenticadas e autorizadas
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Marketplace')); // Exemplo de permissão

// --- Rotas de Configurações de Integração (marketplace_configs) ---
router.get('/integrations', marketplaceConfigController.getAllIntegrations);
router.post('/integrations', marketplaceConfigController.createIntegration);
router.put('/integrations/:id', marketplaceConfigController.updateIntegration);
router.delete('/integrations/:id', marketplaceConfigController.deleteIntegration);

// --- Rotas de Listings de Marketplace (marketplace_listings) ---
router.get('/listings', marketplaceConfigController.getAllListings);
router.post('/listings', marketplaceConfigController.createListing);
router.put('/listings/:id', marketplaceConfigController.updateListing);
router.delete('/listings/:id', marketplaceConfigController.deleteListing);

// --- Rotas de Disparo Manual de Sincronização ---
router.post('/sync-orders/:integrationId', marketplaceConfigController.syncOrdersManually);
router.post('/sync-stock/:variationId', marketplaceConfigController.syncStockManually);

export default router;
