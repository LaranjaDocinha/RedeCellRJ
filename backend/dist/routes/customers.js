var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
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
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map(err => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
customersRouter.use(authMiddleware.authenticate);
// Get all customers
customersRouter.get('/', authMiddleware.authorize('read', 'Customer'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customers = yield customerService.getAllCustomers();
        res.status(200).json(customers);
    }
    catch (error) {
        next(error);
    }
}));
// Get customer by ID
customersRouter.get('/:id', authMiddleware.authorize('read', 'Customer'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield customerService.getCustomerById(parseInt(req.params.id));
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }
        res.status(200).json(customer);
    }
    catch (error) {
        next(error);
    }
}));
// Create a new customer
customersRouter.post('/', authMiddleware.authorize('create', 'Customer'), validate(createCustomerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCustomer = yield customerService.createCustomer(req.body);
        res.status(201).json(newCustomer);
    }
    catch (error) {
        next(error);
    }
}));
// Update a customer by ID
customersRouter.put('/:id', authMiddleware.authorize('update', 'Customer'), validate(updateCustomerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCustomer = yield customerService.updateCustomer(parseInt(req.params.id), req.body);
        if (!updatedCustomer) {
            throw new AppError('Customer not found', 404);
        }
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        next(error);
    }
}));
// Delete a customer by ID
customersRouter.delete('/:id', authMiddleware.authorize('delete', 'Customer'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield customerService.deleteCustomer(parseInt(req.params.id));
        if (!deleted) {
            throw new AppError('Customer not found', 404);
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
export default customersRouter;
