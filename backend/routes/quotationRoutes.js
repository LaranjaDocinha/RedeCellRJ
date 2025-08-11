const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const quotationController = require('../controllers/quotationController');

// Obter todos os orçamentos
router.get('/', [authenticateToken, authorize('quotations:read')], quotationController.getAllQuotations);

// Obter um orçamento por ID
router.get('/:id', [authenticateToken, authorize('quotations:read')], quotationController.getQuotationById);

// Criar um novo orçamento
router.post('/', [authenticateToken, authorize('quotations:create')], quotationController.createQuotation);

// Atualizar um orçamento
router.put('/:id', [authenticateToken, authorize('quotations:update')], quotationController.updateQuotation);

// Deletar um orçamento
router.delete('/:id', [authenticateToken, authorize('quotations:delete')], quotationController.deleteQuotation);

// Gerar e enviar PDF do orçamento por e-mail
router.post('/:id/send-pdf', [authenticateToken, authorize('quotations:send')], quotationController.sendQuotationPdf);

// Atualizar status do orçamento (ex: Aprovado, Rejeitado)
router.patch('/:id/status', [authenticateToken, authorize('quotations:update_status')], quotationController.updateQuotationStatus);

// Converter orçamento para venda
router.post('/:id/convert-to-sale', [authenticateToken, authorize('quotations:convert_to_sale')], quotationController.convertQuotationToSale);

module.exports = router;
