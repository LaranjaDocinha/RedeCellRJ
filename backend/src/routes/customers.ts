import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customerService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { customerCommunicationService } from '../services/customerCommunicationService.js';

import { AppError } from '../utils/errors.js';
import { uploadDocument } from './uploads.js';
import { ocrService } from '../services/ocrService.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js'; // Importar cacheMiddleware
import { sendSuccess } from '../utils/responseHelper.js';

const customersRouter = Router();

// Zod Schemas
const createCustomerSchema = z.object({
  name: z.string().trim().nonempty('Name is required'),
  email: z.string().email('Invalid email format').nonempty('Email is required'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  cpf: z
    .string()
    .optional()
    .nullable()
    .transform((e) => (e === '' ? null : e))
    .refine((val) => !val || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val), {
      message: 'Invalid CPF format',
    }),
  birth_date: z
    .string()
    .optional()
    .nullable()
    .transform((e) => (e === '' ? null : e)),
  referral_code: z.string().optional(),
});

const updateCustomerSchema = z
  .object({
    name: z.string().trim().nonempty('Name cannot be empty').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    cpf: z
      .string()
      .optional()
      .nullable()
      .transform((e) => (e === '' ? null : e))
      .refine((val) => !val || /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(val), {
        message: 'Invalid CPF format',
      }),
    birth_date: z
      .string()
      .optional()
      .nullable()
      .transform((e) => (e === '' ? null : e)),
  })
  .partial();

const loyaltyPointsSchema = z.object({
  points: z.number().int().positive('Points must be a positive integer'),
});

const storeCreditSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  reason: z.string().trim().nonempty('Reason is required'),
});

import { validate } from '../middlewares/validationMiddleware.js';
import * as churnPredictionService from '../services/churnPredictionService.js'; // Added import

import { getClvReport } from '../controllers/clvController.js';
import { getStoreCreditHistory } from '../controllers/storeCreditController.js';

customersRouter.use(authMiddleware.authenticate);

// CLV route
customersRouter.get(
  '/:id/clv',
  authMiddleware.authorize('read', 'Report'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Adapt params for getClvReport if needed, but clvController usually expects req.params.customerId
      req.params.customerId = req.params.id;
      await getClvReport(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// Store Credit History (Unified name matching test expectations)
customersRouter.get(
  '/:id/credit/history',
  authMiddleware.authorize('read', 'StoreCredit'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params.customerId = req.params.id;
      await getStoreCreditHistory(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// Get churn risk for a specific customer
customersRouter.get(
  '/:id/churn-risk',
  authMiddleware.authorize('read', 'Customer'), // Assuming permission to read customer data
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = parseInt(req.params.id, 10);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: 'Invalid customer ID' });
      }
      const churnRisk = await churnPredictionService.getChurnRisk(customerId);
      if (!churnRisk) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      sendSuccess(res, churnRisk);
    } catch (error) {
      next(error);
    }
  },
);

// Get customers with high churn risk
customersRouter.get(
  '/churn-risk/high',
  authMiddleware.authorize('read', 'Customer'), // Assuming permission to read customer data
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const highChurnCustomers = await churnPredictionService.getCustomersWithHighChurnRisk();
      sendSuccess(res, highChurnCustomers);
    } catch (error) {
      next(error);
    }
  },
);

// Get all customers
customersRouter.get(
  '/',
  authMiddleware.authorize('read', 'Customer'),
  cacheMiddleware(), // Aplicar cacheMiddleware aqui
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await customerService.getAllCustomers();
      sendSuccess(res, customers);
    } catch (error) {
      next(error);
    }
  },
);

// Search customers
customersRouter.get(
  '/search',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { searchTerm, limit, offset } = req.query;
      const result = await customerService.searchCustomers({
        searchTerm: searchTerm as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

// Get customer segments
customersRouter.get(
  '/segments',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segments = await customerService.getCustomerSegments();
      sendSuccess(res, segments);
    } catch (error) {
      next(error);
    }
  },
);

// Get customer by ID
customersRouter.get(
  '/:id',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.getCustomerById(req.params.id); // Changed to string as customer ID is UUID
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  },
);

// Get customer 360 view
customersRouter.get(
  '/:id/360view',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer360View = await customerService.getCustomer360View(req.params.id);
      if (!customer360View) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, customer360View);
    } catch (error) {
      next(error);
    }
  },
);

// Get communication history for a customer
customersRouter.get(
  '/:customerId/communications',
  authMiddleware.authorize('read', 'Communication'), // Or 'read', 'Customer'
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const communications = await customerCommunicationService.getCommunicationsForCustomer(
        parseInt(customerId),
      );
      sendSuccess(res, communications);
    } catch (error) {
      next(error);
    }
  },
);

// Create a new customer
customersRouter.post(
  '/',
  authMiddleware.authorize('create', 'Customer'),
  validate(createCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newCustomer = await customerService.createCustomer(req.body);
      sendSuccess(res, newCustomer, 201);
    } catch (error) {
      next(error);
    }
  },
);

// Update a customer by ID
customersRouter.put(
  '/:id',
  authMiddleware.authorize('update', 'Customer'),
  validate(updateCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body);
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Delete a customer by ID
customersRouter.delete(
  '/:id',
  authMiddleware.authorize('delete', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await customerService.deleteCustomer(req.params.id); // Changed to string
      if (!deleted) {
        throw new AppError('Customer not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

// Add loyalty points to a customer
customersRouter.post(
  '/:id/loyalty/add',
  authMiddleware.authorize('update', 'Customer'), // Assuming update permission for loyalty
  validate(loyaltyPointsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { points } = req.body;
      const updatedCustomer = await customerService.addLoyaltyPoints(req.params.id, points);
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Subtract loyalty points from a customer
customersRouter.post(
  '/:id/loyalty/subtract',
  authMiddleware.authorize('update', 'Customer'), // Assuming update permission for loyalty
  validate(loyaltyPointsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { points } = req.body;
      const updatedCustomer = await customerService.subtractLoyaltyPoints(req.params.id, points);
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Add store credit to a customer
customersRouter.post(
  '/:id/credit/add',
  authMiddleware.authorize('update', 'Customer'),
  validate(storeCreditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, reason } = req.body;
      const updatedCustomer = await customerService.addStoreCredit(
        req.params.id,
        amount,
        null, // relatedId is null for manual addition
        null, // client is null (no transaction here yet)
        reason, // Pass reason as the 5th argument
      );
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, { message: 'Store credit added successfully', customer: updatedCustomer });
    } catch (error) {
      next(error);
    }
  },
);

// Deduct store credit from a customer (manual deduction)
customersRouter.post(
  '/:id/credit/debit',
  authMiddleware.authorize('update', 'Customer'),
  validate(storeCreditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, reason } = req.body;
      const updatedCustomer = await customerService.deductStoreCredit(
        req.params.id,
        amount,
        null, // relatedId is null for manual deduction
        null, // client is null
        reason, // Pass reason as the 5th argument
      );
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      sendSuccess(res, { message: 'Store credit debited successfully', customer: updatedCustomer });
    } catch (error) {
      next(error);
    }
  },
);

// Get store credit transactions for a customer
customersRouter.get(
  '/:id/credit/transactions',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await customerService.getStoreCreditTransactions(req.params.id);
      sendSuccess(res, transactions);
    } catch (error) {
      next(error);
    }
  },
);

// Upload document for OCR and customer creation/update
customersRouter.post(
  '/upload-document',
  authMiddleware.authorize('create', 'Customer'), // Permissão para criar cliente
  uploadDocument.single('document'), // Usar o middleware de upload de documento
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('No document file provided', 400));
    }

    const filePath = req.file.path;

    try {
      const ocrText = await ocrService.recognizeText(filePath);
      const extractedData = await ocrService.extractDocumentData(ocrText);

      // Criar ou atualizar cliente com base nos dados extraídos
      const customer = await customerService.createOrUpdateCustomerFromOCR(extractedData);

      sendSuccess(res, {
        message: 'Document processed and customer data updated/created successfully',
        customer: customer,
        extracted_data: extractedData,
      });
    } catch (error) {
      console.error('Error processing document for customer:', error);
      next(new AppError('Failed to process document for customer', 500));
    }
  },
);

export default customersRouter;
