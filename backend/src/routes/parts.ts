import { Router } from 'express';
import * as partController from '../controllers/partController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { partSchema } from '../lib/zodSchemas.js';
import partSuppliersRouter from './partSuppliers.js';

const router = Router();

// POST /api/parts - Create a new part
router.post(
  '/',
  authMiddleware.authorize('create', 'Part'),
  validate(partSchema),
  partController.createPart,
);

// GET /api/parts/search - Search parts
router.get('/search', authMiddleware.authorize('read', 'Part'), partController.searchParts);

// GET /api/parts - Get all parts
router.get('/', partController.getAllParts);

// GET /api/parts/:id - Get a single part by ID
router.get('/:id', partController.getPartById);

// PUT /api/parts/:id - Update a part by ID
router.put('/:id', partController.updatePart);

// DELETE /api/parts/:id - Delete a part by ID
router.delete('/:id', partController.deletePart);

// Nested router for suppliers of a part
router.use('/:partId/suppliers', partSuppliersRouter);

export default router;
