import { Router } from 'express';
import * as assetController from '../controllers/assetController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js'; // Assumindo que validate é um middleware genérico
import { createAssetSchema, updateAssetSchema } from '../controllers/assetController.js'; // TODO: Mover schemas para um arquivo comum

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Asset')); // Permissão geral para gerenciar ativos

// Rotas para Ativos
router.post('/', validate(createAssetSchema), assetController.createAsset);
router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
router.put('/:id', validate(updateAssetSchema), assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

export default router;
