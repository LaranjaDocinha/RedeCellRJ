const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const giftCardController = require('../controllers/giftCardController');

// Criar um novo vale-presente
router.post('/', [authenticateToken, authorize('gift_cards:create')], giftCardController.createGiftCard);

// Obter todos os vales-presente
router.get('/', [authenticateToken, authorize('gift_cards:read')], giftCardController.getAllGiftCards);

// Obter um vale-presente por ID ou Código
router.get('/:id', [authenticateToken, authorize('gift_cards:read')], giftCardController.getGiftCard);

// Resgatar (usar) um vale-presente
router.post('/redeem', [authenticateToken, authorize('gift_cards:redeem')], giftCardController.redeemGiftCard);

// Atualizar status ou valor de um vale-presente (para administração)
router.put('/:id', [authenticateToken, authorize('gift_cards:update')], giftCardController.updateGiftCard);

// Obter histórico de transações de um vale-presente
router.get('/:id/transactions', [authenticateToken, authorize('gift_cards:read')], giftCardController.getGiftCardTransactions);

module.exports = router;
