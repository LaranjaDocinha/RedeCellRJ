const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { param, body } = require('express-validator');
const bankReconciliationController = require('../controllers/bankReconciliationController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'backend/uploads/statements/';
    // Garante que o diretório exista
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceita apenas arquivos CSV
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Apenas CSV é permitido.'), false);
    }
  }
});

// Proteger todas as rotas
router.use(authenticateToken);

// Rota para upload de extrato
router.post(
  '/:accountId/upload',
  authorize('finance:manage'),
  param('accountId').isInt().withMessage('ID da conta bancária inválido.'),
  validate,
  upload.single('statement'), // 'statement' é o nome do campo no formulário
  bankReconciliationController.uploadStatement
);

// Rota para obter transações não conciliadas
router.get(
  '/:accountId/unreconciled',
  authorize('finance:manage'),
  param('accountId').isInt().withMessage('ID da conta bancária inválido.'),
  validate,
  bankReconciliationController.getUnreconciledData
);

// Rota para conciliar transações
router.post(
  '/reconcile',
  authorize('finance:manage'),
  [
    body('bankTransactionId').isInt().withMessage('ID da transação bancária inválido.'),
    body('internalTransactionId').isInt().withMessage('ID da transação interna inválido.'),
    body('internalTransactionType').isIn(['sale', 'expense']).withMessage('Tipo de transação interna inválido.'),
  ],
  validate,
  bankReconciliationController.reconcileTransactions
);

module.exports = router;
