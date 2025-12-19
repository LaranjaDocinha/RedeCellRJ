// backend/tests/unit/productService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productService } from '../../src/services/productService.js';
import pool from '../../src/db/index.js'; // Importar o pool original
// Mock do pool do PostgreSQL
vi.mock('../../src/db/index.js', () => {
    const mockQuery = vi.fn();
    return {
        default: {
            query: mockQuery,
        },
    };
});
// Mock do dynamicPricingService
vi.mock('../../src/services/dynamicPricingService.js', () => ({
    dynamicPricingService: {
        getSuggestedUsedProductPrice: vi.fn(),
    },
}));
describe('productService', () => {
    const mockPoolQuery = pool.query;
    beforeEach(() => {
        mockPoolQuery.mockClear();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });
    describe('createProduct', () => {
        const productData = {
            name: 'Smartphone Teste',
            branch_id: 1,
            sku: 'SMART-001',
            product_type: 'eletronic',
            variations: [
                { color: 'Black', price: 1000, stock_quantity: 10, low_stock_threshold: 2 },
                { color: 'White', price: 1050, stock_quantity: 5, low_stock_threshold: 1 },
            ],
            is_used: false,
            condition: 'new',
            acquisition_date: '2023-01-01',
        };
        it('should create a product and its variations successfully', async () => {
            // 1. BEGIN
            mockPoolQuery.mockResolvedValueOnce({});
            // 2. INSERT products
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });
            // 3. INSERT product_variations
            mockPoolQuery.mockResolvedValueOnce({});
            // 4. COMMIT
            mockPoolQuery.mockResolvedValueOnce({});
            // 5. `getProductById` -> SELECT product
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ ...productData, id: 1 }], rowCount: 1 });
            // 6. `getProductById` -> SELECT variations
            mockPoolQuery.mockResolvedValueOnce({ rows: productData.variations, rowCount: 2 });
            const createdProduct = await productService.createProduct(productData);
            expect(createdProduct).toBeDefined();
            expect(createdProduct?.id).toBe(1);
            expect(mockPoolQuery).toHaveBeenCalledWith('BEGIN');
            expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO products'), expect.arrayContaining([productData.name, productData.branch_id, productData.sku, productData.product_type]));
            expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO product_variations'));
            expect(mockPoolQuery).toHaveBeenCalledWith('COMMIT');
            expect(mockPoolQuery).not.toHaveBeenCalledWith('ROLLBACK');
        });
        it('should rollback transaction if product creation fails', async () => {
            mockPoolQuery.mockResolvedValueOnce({}); // BEGIN
            mockPoolQuery.mockRejectedValueOnce(new Error('DB Error')); // Simulate INSERT products failure
            mockPoolQuery.mockResolvedValueOnce({}); // ROLLBACK
            await expect(productService.createProduct(productData)).rejects.toThrow('DB Error');
            expect(mockPoolQuery).toHaveBeenCalledWith('BEGIN');
            expect(mockPoolQuery).toHaveBeenCalledWith('ROLLBACK');
            expect(mockPoolQuery).not.toHaveBeenCalledWith('COMMIT');
        });
    });
    describe('updateProduct', () => {
        const productId = 1;
        const updateData = {
            name: 'Smartphone Atualizado',
            variations: [
                { id: 101, color: 'Black', price: 1100, stock_quantity: 8, low_stock_threshold: 2 },
                { color: 'Red', price: 1200, stock_quantity: 3, low_stock_threshold: 1 }, // Nova variação, sem ID
            ],
        };
        it('should update a product and its variations successfully', async () => {
            // 1. BEGIN
            mockPoolQuery.mockResolvedValueOnce({});
            // 2. UPDATE products
            mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });
            // 3. SELECT existing variations
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 101 }], rowCount: 1 });
            // Loop: variation com id 101
            // 4. SELECT old price
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ price: 1000 }], rowCount: 1 });
            // 5. UPDATE product_variations
            mockPoolQuery.mockResolvedValueOnce({});
            // 6. INSERT product_price_history
            mockPoolQuery.mockResolvedValueOnce({});
            // Loop: nova variation (sem id)
            // 7. INSERT product_variations
            mockPoolQuery.mockResolvedValueOnce({});
            // getProductById call
            // 8. SELECT product
            mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: updateData.name }], rowCount: 1 });
            // 9. SELECT variations
            mockPoolQuery.mockResolvedValueOnce({ rows: updateData.variations, rowCount: 2 });
            // 10. COMMIT
            mockPoolQuery.mockResolvedValueOnce({});
            const updatedProduct = await productService.updateProduct(productId, updateData);
            expect(updatedProduct).toBeDefined();
            expect(updatedProduct?.name).toBe(updateData.name);
            expect(mockPoolQuery).toHaveBeenCalledWith('BEGIN');
            expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE products SET name = $1'), expect.arrayContaining([updateData.name, productId]));
            // ... outras asserções ...
            expect(mockPoolQuery).toHaveBeenCalledWith('COMMIT');
            expect(mockPoolQuery).not.toHaveBeenCalledWith('ROLLBACK');
        });
        it('should rollback transaction if product update fails', async () => {
            mockPoolQuery.mockResolvedValueOnce({}); // BEGIN
            mockPoolQuery.mockRejectedValueOnce(new Error('DB Error')); // Simulate UPDATE products failure
            mockPoolQuery.mockResolvedValueOnce({}); // ROLLBACK
            await expect(productService.updateProduct(productId, updateData)).rejects.toThrow('DB Error');
            expect(mockPoolQuery).toHaveBeenCalledWith('BEGIN');
            expect(mockPoolQuery).toHaveBeenCalledWith('ROLLBACK');
            expect(mockPoolQuery).not.toHaveBeenCalledWith('COMMIT');
        });
    });
    // Testes adicionais para outras funções podem ser adicionados aqui
    describe('getAllProducts', () => {
        it('should return all products', async () => {
            const mockProducts = [{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }];
            mockPoolQuery.mockResolvedValueOnce({ rows: mockProducts });
            const products = await productService.getAllProducts();
            expect(products).toEqual(mockProducts);
            expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id, name, description, sku, branch_id FROM products ORDER BY name ASC');
        });
    });
    describe('deleteProduct', () => {
        it('should delete a product and its variations', async () => {
            mockPoolQuery.mockResolvedValueOnce({}); // DELETE product_variations
            mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // DELETE products
            const isDeleted = await productService.deleteProduct(1);
            expect(isDeleted).toBe(true);
            expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM product_variations WHERE product_id = $1', [1]);
            expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM products WHERE id = $1', [1]);
        });
        it('should return false if product not found for deletion', async () => {
            mockPoolQuery.mockResolvedValueOnce({}); // DELETE product_variations
            mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 }); // DELETE products
            const isDeleted = await productService.deleteProduct(999);
            expect(isDeleted).toBe(false);
        });
    });
});
