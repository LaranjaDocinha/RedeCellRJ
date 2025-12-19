import { Router } from 'express';
import { productService } from '../services/productService.js';
import { NotFoundError } from '../utils/errors.js';
import QRCode from 'qrcode'; // Import the qrcode library
const router = Router();
// Define the base URL for the frontend product page (adjust as needed for deployment)
const FRONTEND_PRODUCT_BASE_URL = process.env.FRONTEND_PRODUCT_BASE_URL || 'http://localhost:3000/product';
// Get all products (public)
router.get('/', async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
});
// Get a single product by ID (public)
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new NotFoundError('Invalid product ID');
        }
        const product = await productService.getProductById(id);
        if (product) {
            res.status(200).json(product);
        }
        else {
            throw new NotFoundError('Product not found');
        }
    }
    catch (error) {
        next(error);
    }
});
// Get suggested used product price (public)
router.get('/:id/suggested-used-price', async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            throw new NotFoundError('Invalid product ID');
        }
        const suggestedPrice = await productService.getSuggestedUsedProductPrice(productId);
        if (suggestedPrice !== null) {
            res.status(200).json({ suggested_price: suggestedPrice });
        }
        else {
            res.status(404).json({ message: 'Product not found or not a used product' });
        }
    }
    catch (error) {
        next(error);
    }
});
// Generate a QR code for the public product page
router.get('/:id/qrcode', async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);
        if (isNaN(productId)) {
            throw new NotFoundError('Invalid product ID');
        }
        // Construct the public URL for the product
        const productPublicUrl = `${FRONTEND_PRODUCT_BASE_URL}/${productId}`;
        // Generate QR code as a data URL (Base64 image)
        const qrCodeDataUrl = await QRCode.toDataURL(productPublicUrl, { errorCorrectionLevel: 'H', type: 'image/png' });
        // Send the data URL as a JSON response
        res.status(200).json({ qrCodeImage: qrCodeDataUrl });
    }
    catch (error) {
        next(error);
    }
});
export default router;
