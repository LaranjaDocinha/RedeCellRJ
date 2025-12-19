import { Router } from 'express';
import * as contractController from '../controllers/contractController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize('manage', 'Contract')); // Permissão geral para gerenciar contratos

// Gerar e salvar um contrato para uma venda
router.post('/:saleId/generate-and-save', contractController.generateAndSaveContract);

// Obter um contrato por ID
router.get('/:id', contractController.getSaleContractById);

// Obter todos os contratos de uma venda
router.get('/sale/:saleId', contractController.getSaleContractsBySaleId);

// Assinar um contrato (adicionar imagem da assinatura)
router.patch('/:id/sign', contractController.signSaleContract);

export default router;
