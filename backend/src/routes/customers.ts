import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { customerService } from '../services/customerService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError, AppError } from '../utils/errors.js';

const customersRouter = Router();

// Zod Schemas
const createCustomerSchema = z.object({
  name: z.string().trim().nonempty('Name is required'),
  email: z.string().email('Invalid email format').nonempty('Email is required'),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const updateCustomerSchema = z.object({
  name: z.string().trim().nonempty('Name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
}).partial();

// Validation Middleware
const validate = (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
    }
    next(error);
  }
};

customersRouter.use(authMiddleware.authenticate);

// Get all customers
customersRouter.get(
  '/',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json(customers);
    } catch (error) {
      next(error);
    }
  }
);

// Get customer by ID
customersRouter.get(
  '/:id',
  authMiddleware.authorize('read', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await customerService.getCustomerById(parseInt(req.params.id));
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  }
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
  }
);

// Update a customer by ID
customersRouter.put(
  '/:id',
  authMiddleware.authorize('update', 'Customer'),
  validate(updateCustomerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedCustomer = await customerService.updateCustomer(parseInt(req.params.id), req.body);
      if (!updatedCustomer) {
        throw new AppError('Customer not found', 404);
      }
      res.status(200).json(updatedCustomer);
    } catch (error) {
      next(error);
    }
  }
);

// Delete a customer by ID
customersRouter.delete(
  '/:id',
  authMiddleware.authorize('delete', 'Customer'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await customerService.deleteCustomer(parseInt(req.params.id));
      if (!deleted) {
        throw new AppError('Customer not found', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default customersRouter;