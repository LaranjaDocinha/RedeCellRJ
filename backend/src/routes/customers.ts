import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customerService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { customerCommunicationService } from '../services/customerCommunicationService.js';

import { ValidationError, AppError } from '../utils/errors.js';
import { uploadDocument } from './uploads.js';
import { ocrService } from '../services/ocrService.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js'; // Importar cacheMiddleware

const customersRouter = Router();

// Zod Schemas
const createCustomerSchema = z.object({
  name: z.string().trim().nonempty('Name is required'),
  email: z.string().email('Invalid email format').nonempty('Email is required'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Invalid CPF format')
    .optional()
    .nullable(),
  birth_date: z.string().datetime().optional().nullable(),
});

const updateCustomerSchema = z
  .object({
    name: z.string().trim().nonempty('Name cannot be empty').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    cpf: z
      .string()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Invalid CPF format')
      .optional()
      .nullable(),
    birth_date: z.string().datetime().optional().nullable(),
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

customersRouter.use(authMiddleware.authenticate);

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
      res.status(200).json(churnRisk);
    } catch (error) {
      next(error);
    }
  }
);

// Get customers with high churn risk
customersRouter.get(
  '/churn-risk/high',
  authMiddleware.authorize('read', 'Customer'), // Assuming permission to read customer data
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const highChurnCustomers = await churnPredictionService.getCustomersWithHighChurnRisk();
      res.status(200).json(highChurnCustomers);
    } catch (error) {
      next(error);
    }
  }
);

// Get all customers
customersRouter.get(
  '/',
  authMiddleware.authorize('read', 'Customer'),
  cacheMiddleware(), // Aplicar cacheMiddleware aqui
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json(customers);
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
      res.status(200).json(result);
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
      res.status(200).json(segments);
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
      res.status(200).json(customer);
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
      res.status(200).json(customer360View);
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
      res.status(200).json(communications);
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
      res.status(201).json(newCustomer);
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
      const updatedCustomer = await customerService.updateCustomer(
        req.params.id,
        req.body,
      );
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      res.status(200).json(updatedCustomer);
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
      res.status(200).json(updatedCustomer);
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
      res.status(200).json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Add store credit to a customer
customersRouter.post(
  '/:id/store-credit/add',
  authMiddleware.authorize('update', 'Customer'),
  validate(storeCreditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, reason } = req.body;
      const updatedCustomer = await customerService.addStoreCredit(
        req.params.id,
        amount,
        reason, // Pass reason
        null // TODO: req.client was here, needs a transaction middleware
      ); // Pass client for transaction
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      res.status(200).json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Deduct store credit from a customer (manual deduction)
customersRouter.post(
  '/:id/store-credit/deduct',
  authMiddleware.authorize('update', 'Customer'),
  validate(storeCreditSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, reason } = req.body;
      const updatedCustomer = await customerService.deductStoreCredit(
        req.params.id,
        amount,
        reason, // Pass reason
        null // TODO: req.client was here, needs a transaction middleware
      ); // Pass client for transaction
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      res.status(200).json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  },
);

// Get store credit transactions for a customer
customersRouter.get(
  '/:id/store-credit/transactions',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await customerService.getStoreCreditTransactions(req.params.id);
      res.status(200).json(transactions);
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

      res.status(200).json({
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
