import { Router, Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService.js';
import { NotFoundError } from '../utils/errors.js';
import QRCode from 'qrcode'; // Import the qrcode library
import { z } from 'zod'; // Importar Zod
import { ValidationError } from '../utils/errors.js'; // Importar ValidationError

const router = Router();

// Define the base URL for the frontend product page (adjust as needed for deployment)
const FRONTEND_PRODUCT_BASE_URL =
  process.env.FRONTEND_PRODUCT_BASE_URL || 'http://localhost:3000/product';

// Zod Schema for product listing query parameters
const getProductsQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z
    .preprocess((val) => parseInt(val as string, 10), z.number().int().positive())
    .optional(),
  minPrice: z.preprocess((val) => parseFloat(val as string), z.number().positive()).optional(),
  maxPrice: z.preprocess((val) => parseFloat(val as string), z.number().positive()).optional(),
  sortBy: z.enum(['name', 'price', 'created_at']).default('name').optional(),
  sortDirection: z.enum(['ASC', 'DESC']).default('ASC').optional(),
  limit: z
    .preprocess((val) => parseInt(val as string, 10), z.number().int().positive())
    .default(10),
  offset: z
    .preprocess((val) => parseInt(val as string, 10), z.number().int().nonnegative())
    .default(0),
});

// Validation Middleware
const validateQuery =
  (schema: z.ZodObject<any, any, any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query); // Valida e insere os valores default
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.errors.map((err) => ({ path: err.path.join('.'), message: err.message })),
          ),
        );
      }
      next(error);
    }
  };

// Get all products (public)
router.get(
  '/',
  validateQuery(getProductsQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options = req.query as unknown as Parameters<typeof productService.getAllProducts>[0]; // Cast validado
      const { products, totalCount } = await productService.getAllProducts(options);
      res.status(200).json({ products, totalCount });
    } catch (error) {
      next(error);
    }
  },
);

// Get a single product by ID (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid product ID');
    }
    const product = await productService.getProductById(id);
    if (product) {
      res.status(200).json(product);
    } else {
      throw new NotFoundError('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

// Get suggested used product price (public)
router.get('/:id/suggested-used-price', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      throw new NotFoundError('Invalid product ID');
    }
    const suggestedPrice = await productService.getSuggestedUsedProductPrice(productId);
    if (suggestedPrice !== null) {
      res.status(200).json({ suggested_price: suggestedPrice });
    } else {
      res.status(404).json({ message: 'Product not found or not a used product' });
    }
  } catch (error) {
    next(error);
  }
});

// Generate a QR code for the public product page
router.get('/:id/qrcode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      throw new NotFoundError('Invalid product ID');
    }

    // Construct the public URL for the product
    const productPublicUrl = `${FRONTEND_PRODUCT_BASE_URL}/${productId}`;

    // Generate QR code as a data URL (Base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(productPublicUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
    });

    // Send the data URL as a JSON response
    res.status(200).json({ qrCodeImage: qrCodeDataUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
