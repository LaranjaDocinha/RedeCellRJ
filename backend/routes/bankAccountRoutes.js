const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import multer
const upload = multer(); // Create a multer instance for file uploads
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const bankAccountController = require('../controllers/bankAccountController');

// Criar uma nova conta bancária
router.post('/', [authenticateToken, authorize('bank_accounts:manage')], bankAccountController.createBankAccount);

// Obter todas as contas bancárias
router.get('/', [authenticateToken, authorize('bank_accounts:read')], bankAccountController.getAllBankAccounts);

// Obter uma conta bancária por ID
router.get('/:id', [authenticateToken, authorize('bank_accounts:read')], bankAccountController.getBankAccountById);

// Atualizar uma conta bancária
router.put('/:id', [authenticateToken, authorize('bank_accounts:manage')], bankAccountController.updateBankAccount);

// Deletar uma conta bancária
router.delete('/:id', [authenticateToken, authorize('bank_accounts:manage')], bankAccountController.deleteBankAccount);

// Importar transações bancárias via CSV
router.post('/:id/import-transactions', [authenticateToken, authorize('bank_accounts:manage'), upload.single('csvFile')], bankAccountController.importBankTransactions);

// Obter transações bancárias para uma conta específica
router.get('/:id/transactions', [authenticateToken, authorize('bank_accounts:read')], bankAccountController.getBankTransactions);

module.exports = router;